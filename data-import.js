// 数据导入模块

// 导入数据处理函数
function handleFileImport(file) {
    // 重置错误信息
    resetImportError();
    
    // 检查文件是否存在
    if (!file) {
        showImportError('请选择要导入的文件');
        return;
    }
    
    // 检查文件类型
    if (!(file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel')) {
        showImportError('请上传Excel文件（.xlsx或.xls格式）');
        return;
    }
    
    // 检查文件大小（限制为10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        showImportError(`文件大小超过限制（最大10MB），当前大小：${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        return;
    }
    
    // 显示加载状态
    showImportLoading();
    
    // 显示文件名和大小
    updateFileInfo(file);
    
    // 在实际项目中，这里应该使用FileReader API读取文件并发送到后端处理
    // 这里使用模拟数据演示功能
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // 模拟数据处理和验证
        setTimeout(() => {
            try {
                // 模拟数据处理完成
                hideImportLoading();
                
                // 获取导入数据
                const importData = getMockImportData();
                
                // 数据验证
                const validationResult = validateImportData(importData);
                if (!validationResult.valid) {
                    showImportError(validationResult.message);
                    return;
                }
                
                // 获取现有客户数据
                const existingCustomers = getAllCustomerData();
                
                // 处理数据更新和匹配
                const processResult = processCustomerData(importData, existingCustomers);
                
                // 显示成功消息
                showImportSuccess();
                
                // 更新数据预览，使用处理后的数据
                updateDataPreview(processResult.processedData);
                
                // 显示更新统计信息
                updateImportStats(processResult);
                
                // 切换到数据预览标签
                switchTab('data-preview');
                
                // 启用导入按钮
                document.getElementById('confirm-import-btn').disabled = false;
            } catch (error) {
                hideImportLoading();
                showImportError(`处理文件时发生错误: ${error.message}`);
                console.error('导入处理错误:', error);
            }
        }, 1500);
    };
    
    reader.onerror = function() {
        hideImportLoading();
        showImportError('读取文件时发生错误');
    };
    
    // 开始读取文件（在实际应用中，这里会解析Excel文件内容）
    reader.readAsArrayBuffer(file);
}

// 处理客户数据匹配与更新
function processCustomerData(importData, existingData) {
    const processedData = [];
    const updatedRecords = [];
    const newRecords = [];
    
    // 获取当前日期
    const currentDate = new Date().toISOString().split('T')[0];
    
    // 处理每条导入数据
    importData.forEach(importItem => {
        // 查找是否存在此客户
        const existingCustomer = existingData.find(item => item.name === importItem.name);
        
        if (existingCustomer) {
            // 客户已存在，进行数据更新
            const updatedCustomer = { ...existingCustomer };
            
            // 处理每项导入数据
            if (importItem.type === '销售') {
                // 销售订单：增加已用额度和应收账款
                updatedCustomer.usedCredit += importItem.amount;
                updatedCustomer.receivable += importItem.amount;
                
                // 添加订单记录
                updatedCustomer.orders.unshift({
                    date: importItem.date || currentDate,
                    type: '销售',
                    amount: importItem.amount,
                    status: 'pending'
                });
                
            } else if (importItem.type === '回款') {
                // 回款：减少应收账款，不影响已用额度（已发货但未回款的部分）
                updatedCustomer.receivable = Math.max(0, updatedCustomer.receivable - importItem.amount);
                
                // 记录最后回款日期
                updatedCustomer.lastPaymentDate = importItem.date || currentDate;
                
                // 添加回款记录
                updatedCustomer.orders.unshift({
                    date: importItem.date || currentDate,
                    type: '回款',
                    amount: importItem.amount,
                    status: 'completed'
                });
                
                // 检查是否有未完成的订单可以标记为已完成
                let remainingPayment = importItem.amount;
                for (let i = 0; i < updatedCustomer.orders.length; i++) {
                    const order = updatedCustomer.orders[i];
                    if (order.type === '销售' && order.status === 'pending' && remainingPayment > 0) {
                        // 如果回款金额足够覆盖该订单
                        if (remainingPayment >= order.amount) {
                            order.status = 'completed';
                            remainingPayment -= order.amount;
                            // 减少已用额度（已回款的部分）
                            updatedCustomer.usedCredit = Math.max(0, updatedCustomer.usedCredit - order.amount);
                        } else {
                            // 部分覆盖情况下不更改状态，但减少已用额度
                            updatedCustomer.usedCredit = Math.max(0, updatedCustomer.usedCredit - remainingPayment);
                            remainingPayment = 0;
                        }
                    }
                }
                
                // 如果回款超过应收账款，记录多出部分
                if (remainingPayment > 0) {
                    updatedCustomer.prepaidAmount = (updatedCustomer.prepaidAmount || 0) + remainingPayment;
                }
            }
            
            // 更新风险评级 (基于预定义规则)
            updatedCustomer.riskLevel = calculateRiskLevel(updatedCustomer);
            
            updatedRecords.push(updatedCustomer);
            processedData.push({
                ...updatedCustomer,
                isNew: false,
                changes: detectChanges(existingCustomer, updatedCustomer)
            });
        } else {
            // 新客户，创建记录
            const newCustomer = {
                name: importItem.name,
                contact: importItem.contact || '未设置',
                phone: importItem.phone || '未设置',
                creditLimit: importItem.creditLimit || 1000000, // 默认授信额度
                usedCredit: importItem.type === '销售' ? importItem.amount : 0,
                receivable: importItem.type === '销售' ? importItem.amount : 0,
                prepaidAmount: importItem.type === '回款' ? importItem.amount : 0,
                paymentTerms: importItem.paymentTerms || 30, // 默认30天
                lastPaymentDate: importItem.type === '回款' ? (importItem.date || currentDate) : null,
                orders: [{
                    date: importItem.date || currentDate,
                    type: importItem.type,
                    amount: importItem.amount,
                    status: importItem.type === '回款' ? 'completed' : 'pending'
                }],
                businessSummary: {
                    totalYears: 0,
                    totalAmount: importItem.amount,
                    orderCount: 1
                }
            };
            
            // 计算初始风险评级
            newCustomer.riskLevel = 'medium'; // 新客户默认为中等风险
            
            newRecords.push(newCustomer);
            processedData.push({
                ...newCustomer,
                isNew: true
            });
        }
    });
    
    return {
        processedData,
        updatedRecords,
        newRecords,
        statistics: {
            totalProcessed: processedData.length,
            updated: updatedRecords.length,
            new: newRecords.length
        }
    };
}

// 计算客户风险等级
function calculateRiskLevel(customer) {
    // 计算用信比例
    const creditUsageRatio = customer.creditLimit > 0 ? customer.usedCredit / customer.creditLimit : 0;
    
    // 获取最早和最近的订单日期
    const orderDates = customer.orders
        .filter(order => order.type === '销售')
        .map(order => new Date(order.date).getTime());
    
    const lastPaymentDate = customer.lastPaymentDate ? new Date(customer.lastPaymentDate).getTime() : 0;
    const currentDate = new Date().getTime();
    
    // 计算回款及时性 (如果距离上次回款超过45天并且有应收账款)
    const daysSinceLastPayment = lastPaymentDate ? Math.floor((currentDate - lastPaymentDate) / (1000 * 60 * 60 * 24)) : 999;
    const hasLatePayment = daysSinceLastPayment > customer.paymentTerms && customer.receivable > 0;
    
    // 检查逾期订单比例
    const overdueOrders = customer.orders.filter(order => order.status === 'overdue').length;
    const totalOrders = customer.orders.filter(order => order.type === '销售').length;
    const overdueRatio = totalOrders > 0 ? overdueOrders / totalOrders : 0;
    
    // 基于以上因素确定风险等级
    if (creditUsageRatio > 0.8 || hasLatePayment || overdueRatio > 0.3) {
        return 'high'; // 高用信比例、逾期付款或多个逾期订单 = 高风险
    } else if (creditUsageRatio > 0.6 || daysSinceLastPayment > customer.paymentTerms * 0.8 || overdueRatio > 0.1) {
        return 'medium'; // 中等用信比例、接近逾期或少量逾期订单 = 中等风险
    } else {
        return 'low'; // 低用信比例、回款及时 = 低风险
    }
}

// 检测客户数据变更
function detectChanges(oldData, newData) {
    const changes = [];
    
    // 检查授信额度变化
    if (oldData.creditLimit !== newData.creditLimit) {
        changes.push({
            field: 'creditLimit',
            oldValue: oldData.creditLimit,
            newValue: newData.creditLimit,
            description: '授信额度变更'
        });
    }
    
    // 检查已用额度变化
    if (oldData.usedCredit !== newData.usedCredit) {
        changes.push({
            field: 'usedCredit',
            oldValue: oldData.usedCredit,
            newValue: newData.usedCredit,
            description: '已用额度变更'
        });
    }
    
    // 检查应收账款变化
    if (oldData.receivable !== newData.receivable) {
        changes.push({
            field: 'receivable',
            oldValue: oldData.receivable,
            newValue: newData.receivable,
            description: '应收账款变更'
        });
    }
    
    // 检查风险等级变化
    if (oldData.riskLevel !== newData.riskLevel) {
        changes.push({
            field: 'riskLevel',
            oldValue: oldData.riskLevel,
            newValue: newData.riskLevel,
            description: '风险等级变更'
        });
    }
    
    // 检查最后回款日期变化
    if (oldData.lastPaymentDate !== newData.lastPaymentDate) {
        changes.push({
            field: 'lastPaymentDate',
            oldValue: oldData.lastPaymentDate,
            newValue: newData.lastPaymentDate,
            description: '最后回款日期更新'
        });
    }
    
    return changes;
}

// 更新导入统计信息
function updateImportStats(processResult) {
    const statsContainer = document.getElementById('import-stats');
    if (!statsContainer) return;
    
    // 使用处理结果中的统计信息
    const totalCustomers = processResult.processedData.length;
    const newCustomers = processResult.newRecords.length;
    const updatedCustomers = processResult.updatedRecords.length;
    const highRiskCustomers = processResult.processedData.filter(c => c.riskLevel === 'high').length;
    
    // 更新统计信息
    statsContainer.innerHTML = `
        <div class="stat-item">
            <div class="stat-value">${totalCustomers}</div>
            <div class="stat-label">总客户数</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${newCustomers}</div>
            <div class="stat-label">新增客户</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">${updatedCustomers}</div>
            <div class="stat-label">更新客户</div>
        </div>
        <div class="stat-item ${highRiskCustomers > 0 ? 'stat-warning' : ''}">
            <div class="stat-value">${highRiskCustomers}</div>
            <div class="stat-label">高风险客户</div>
        </div>
    `;
}

// 显示导入错误
function showImportError(message) {
    const errorContainer = document.getElementById('import-error');
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        errorContainer.classList.add('shake'); // 添加抖动效果引起注意
        
        // 移除抖动效果，以便下次可以再次触发
        setTimeout(() => {
            errorContainer.classList.remove('shake');
        }, 500);
    } else {
        alert(`导入错误: ${message}`);
    }
    
    // 滚动到错误信息位置
    errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// 重置导入错误
function resetImportError() {
    const errorContainer = document.getElementById('import-error');
    if (errorContainer) {
        errorContainer.textContent = '';
        errorContainer.style.display = 'none';
    }
}

// 更新文件信息显示
function updateFileInfo(file) {
    const fileNameDisplay = document.getElementById('file-name-display');
    const selectedFileName = document.getElementById('selected-file-name');
    
    if (fileNameDisplay && selectedFileName) {
        // 格式化文件大小
        const fileSize = formatFileSize(file.size);
        
        // 更新文件名和大小显示
        selectedFileName.innerHTML = `${file.name} <span class="file-size">(${fileSize})</span>`;
        fileNameDisplay.classList.add('active');
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 验证导入数据
function validateImportData(data) {
    // 检查数据是否为空
    if (!data || data.length === 0) {
        return {
            valid: false,
            message: '导入的数据为空，请检查文件内容'
        };
    }
    
    // 检查必填字段
    const requiredFields = ['name', 'industry', 'credit', 'used'];
    const missingFields = [];
    
    // 检查第一条记录的字段
    requiredFields.forEach(field => {
        if (data[0][field] === undefined) {
            missingFields.push(field);
        }
    });
    
    if (missingFields.length > 0) {
        return {
            valid: false,
            message: `导入数据缺少必要字段: ${missingFields.join(', ')}`
        };
    }
    
    // 检查数据格式
    const invalidRecords = [];
    
    data.forEach((record, index) => {
        // 检查数值字段
        if (typeof record.credit !== 'number' || record.credit < 0) {
            invalidRecords.push(`记录 ${index + 1}: 授信额度必须为正数`);
        }
        
        if (typeof record.used !== 'number' || record.used < 0) {
            invalidRecords.push(`记录 ${index + 1}: 已用额度必须为正数`);
        }
    });
    
    if (invalidRecords.length > 0) {
        return {
            valid: false,
            message: `数据格式错误:\n${invalidRecords.slice(0, 3).join('\n')}${invalidRecords.length > 3 ? `\n...等共 ${invalidRecords.length} 处错误` : ''}`
        };
    }
    
    return { valid: true };
}

// 显示导入加载状态
function showImportLoading() {
    const importContainer = document.getElementById('import-container');
    if (importContainer) {
        importContainer.classList.add('loading');
    }
    
    const loadingIndicator = document.getElementById('import-loading');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
}

// 隐藏导入加载状态
function hideImportLoading() {
    const importContainer = document.getElementById('import-container');
    if (importContainer) {
        importContainer.classList.remove('loading');
    }
    
    const loadingIndicator = document.getElementById('import-loading');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

// 显示导入成功
function showImportSuccess(message = '数据导入成功！') {
    const successMessage = document.createElement('div');
    successMessage.className = 'import-success-message';
    successMessage.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
        successMessage.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        successMessage.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(successMessage);
        }, 300);
    }, 3000);
}

// 更新数据预览
function updateDataPreview(data) {
    const previewTable = document.querySelector('#data-preview-tab table tbody');
    if (!previewTable) return;
    
    // 清空现有数据
    previewTable.innerHTML = '';
    
    // 添加新数据
    data.forEach(customer => {
        const row = document.createElement('tr');
        
        // 根据风险等级添加样式
        if (customer.riskLevel === 'high') {
            row.classList.add('risk-high');
        } else if (customer.riskLevel === 'medium') {
            row.classList.add('risk-medium');
        }
        
        // 为新客户添加标记
        if (customer.isNew) {
            row.classList.add('new-customer');
        }
        
        // 计算使用率并添加相应样式
        const usageRatio = customer.used / customer.credit;
        if (usageRatio > 0.9) {
            row.classList.add('usage-critical');
        } else if (usageRatio > 0.7) {
            row.classList.add('usage-warning');
        }
        
        // 格式化金额
        const formattedCredit = `¥${customer.credit.toLocaleString()}`;
        const formattedUsed = `¥${customer.used.toLocaleString()}`;
        const usagePercent = `${Math.round(usageRatio * 100)}%`;
        
        // 状态标签样式
        let statusClass = 'status-normal';
        if (customer.status === '逾期') {
            statusClass = 'status-overdue';
        } else if (customer.status === '警告') {
            statusClass = 'status-warning';
        }
        
        // 添加行点击事件，显示详细信息
        row.addEventListener('click', () => showCustomerDetail(customer));
        row.classList.add('clickable');
        
        row.innerHTML = `
            <td>${customer.isNew ? '<span class="new-badge">新</span> ' : ''}${customer.name}</td>
            <td>${customer.industry}</td>
            <td>${formattedCredit}</td>
            <td>
                <div class="usage-info">
                    <div>${formattedUsed}</div>
                    <div class="usage-bar-container">
                        <div class="usage-bar" style="width: ${usagePercent};"></div>
                    </div>
                    <div class="usage-percent">${usagePercent}</div>
                </div>
            </td>
            <td><span class="rating-badge rating-${customer.creditRating.toLowerCase()}">${customer.creditRating}</span></td>
            <td><span class="status-badge ${statusClass}">${customer.status}</span></td>
            <td>
                <button class="btn-icon btn-detail" title="查看详情">
                    <i class="fas fa-info-circle"></i>
                </button>
            </td>
        `;
        
        previewTable.appendChild(row);
    });
    
    // 更新数据清洗信息
    updateDataCleanupInfo(data);
    
    // 更新风险分析
    updateRiskAnalysis(data);
}

// 显示客户详细信息
function showCustomerDetail(customer) {
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    // 计算使用率
    const usageRatio = customer.used / customer.credit;
    const usagePercent = `${Math.round(usageRatio * 100)}%`;
    
    // 风险评级颜色
    const ratingClass = `rating-${customer.creditRating.toLowerCase()}`;
    
    // 模态框内容
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${customer.name} ${customer.isNew ? '<span class="new-badge">新客户</span>' : ''}</h3>
                <button class="modal-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="customer-detail-grid">
                    <div class="detail-item">
                        <div class="detail-label">行业</div>
                        <div class="detail-value">${customer.industry}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">授信额度</div>
                        <div class="detail-value">¥${customer.credit.toLocaleString()}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">已用额度</div>
                        <div class="detail-value">¥${customer.used.toLocaleString()}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">使用率</div>
                        <div class="detail-value ${usageRatio > 0.7 ? 'text-warning' : ''}">${usagePercent}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">应收账款</div>
                        <div class="detail-value">¥${customer.receivable ? customer.receivable.toLocaleString() : '0'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">账期</div>
                        <div class="detail-value">${customer.terms}天</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">最近付款</div>
                        <div class="detail-value">${customer.lastPayment || '无记录'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">信用评级</div>
                        <div class="detail-value"><span class="rating-badge ${ratingClass}">${customer.creditRating}</span></div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">风险等级</div>
                        <div class="detail-value">${getRiskLevelText(customer.creditRating)}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">状态</div>
                        <div class="detail-value"><span class="status-badge ${customer.status === '逾期' ? 'status-overdue' : 'status-normal'}">${customer.status}</span></div>
                    </div>
                </div>
                
                <div class="detail-actions">
                    <button class="btn btn-primary">查看完整档案</button>
                    <button class="btn btn-outline">导出数据</button>
                </div>
            </div>
        </div>
    `;
    
    // 添加到文档
    document.body.appendChild(modal);
    
    // 添加关闭事件
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // 点击模态框外部关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // 显示模态框
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// 获取风险状态样式类
function getRiskStatusClass(riskLevel) {
    switch(riskLevel) {
        case 'A': return 'status-active';
        case 'B': return 'status-active';
        case 'C': return 'status-warning';
        case 'D': return 'status-danger';
        default: return 'status-active';
    }
}

// 获取风险等级文本
function getRiskLevelText(riskLevel) {
    switch(riskLevel) {
        case 'A': return 'A级（低风险）';
        case 'B': return 'B级（中风险）';
        case 'C': return 'C级（高风险）';
        case 'D': return 'D级（极高风险）';
        default: return '未知';
    }
}

// 更新数据清洗信息
function updateDataCleanupInfo(data) {
    // 模拟数据清洗过程
    const cleanupInfo = analyzeDataQuality(data);
    
    // 更新清洗信息显示
    const cleanupSummary = document.querySelector('#data-cleanup-tab .cleanup-summary ul');
    if (!cleanupSummary) return;
    
    // 清空现有内容
    cleanupSummary.innerHTML = '';
    
    // 添加清洗信息
    const issues = [
        { type: 'duplicates', label: '重复记录', action: '已删除' },
        { type: 'formatErrors', label: '格式错误', action: '已修正' },
        { type: 'missingValues', label: '缺失值', action: '已标记' },
        { type: 'outliers', label: '异常值', action: '已标记' },
        { type: 'inconsistentData', label: '数据不一致', action: '已修正' }
    ];
    
    issues.forEach(issue => {
        if (cleanupInfo[issue.type] > 0) {
            const li = document.createElement('li');
            li.innerHTML = `${issue.label}：<strong>${cleanupInfo[issue.type]}</strong>条（${issue.action}）`;
            
            // 为严重问题添加警告样式
            if (issue.type === 'duplicates' && cleanupInfo[issue.type] > 5 ||
                issue.type === 'formatErrors' && cleanupInfo[issue.type] > 10 ||
                issue.type === 'outliers' && cleanupInfo[issue.type] > 3) {
                li.classList.add('warning-item');
            }
            
            cleanupSummary.appendChild(li);
        }
    });
    
    // 更新数据质量评分
    updateDataQualityScore(cleanupInfo, data.length);
}

// 分析数据质量
function analyzeDataQuality(data) {
    // 在实际应用中，这里应该进行真实的数据分析
    // 这里使用模拟数据
    
    // 基础问题数量
    const baseIssues = {
        duplicates: 3,
        formatErrors: 5,
        missingValues: 8,
        outliers: 2,
        inconsistentData: 4
    };
    
    // 根据数据量调整问题数量，模拟真实场景
    const dataVolumeFactor = Math.max(1, Math.floor(data.length / 5));
    
    return {
        duplicates: Math.min(baseIssues.duplicates * dataVolumeFactor, Math.floor(data.length * 0.1)),
        formatErrors: Math.min(baseIssues.formatErrors * dataVolumeFactor, Math.floor(data.length * 0.15)),
        missingValues: Math.min(baseIssues.missingValues * dataVolumeFactor, Math.floor(data.length * 0.2)),
        outliers: Math.min(baseIssues.outliers * dataVolumeFactor, Math.floor(data.length * 0.05)),
        inconsistentData: Math.min(baseIssues.inconsistentData * dataVolumeFactor, Math.floor(data.length * 0.08))
    };
}

// 更新数据质量评分
function updateDataQualityScore(cleanupInfo, totalRecords) {
    const scoreContainer = document.querySelector('#data-cleanup-tab .data-quality-score');
    if (!scoreContainer) return;
    
    // 计算总问题数
    const totalIssues = Object.values(cleanupInfo).reduce((sum, count) => sum + count, 0);
    
    // 计算质量评分 (0-100)
    const qualityScore = Math.max(0, Math.min(100, Math.round(100 - (totalIssues / totalRecords) * 100)));
    
    // 确定评分等级
    let qualityLevel, qualityClass;
    if (qualityScore >= 90) {
        qualityLevel = '优秀';
        qualityClass = 'score-excellent';
    } else if (qualityScore >= 75) {
        qualityLevel = '良好';
        qualityClass = 'score-good';
    } else if (qualityScore >= 60) {
        qualityLevel = '一般';
        qualityClass = 'score-average';
    } else {
        qualityLevel = '较差';
        qualityClass = 'score-poor';
    }
    
    // 更新评分显示
    scoreContainer.innerHTML = `
        <div class="score-circle ${qualityClass}">
            <div class="score-value">${qualityScore}</div>
            <div class="score-label">数据质量</div>
        </div>
        <div class="score-description">
            <div class="score-level">质量评级：<strong>${qualityLevel}</strong></div>
            <div class="score-detail">共发现 ${totalIssues} 个问题，占总记录的 ${Math.round((totalIssues / totalRecords) * 100)}%</div>
        </div>
    `;
}

// 更新风险分析
function updateRiskAnalysis(data) {
    const riskContainer = document.querySelector('#data-preview-tab .risk-analysis');
    if (!riskContainer) return;
    
    // 计算风险统计
    const riskStats = analyzeRiskDistribution(data);
    
    // 更新风险分析显示
    riskContainer.innerHTML = `
        <h4>风险分布分析</h4>
        <div class="risk-distribution">
            <div class="risk-bar-container">
                <div class="risk-bar risk-low" style="width: ${riskStats.lowRiskPercent}%" title="低风险: ${riskStats.lowRiskCount}个客户">
                    <span class="risk-label">低</span>
                    <span class="risk-percent">${riskStats.lowRiskPercent}%</span>
                </div>
                <div class="risk-bar risk-medium" style="width: ${riskStats.mediumRiskPercent}%" title="中风险: ${riskStats.mediumRiskCount}个客户">
                    <span class="risk-label">中</span>
                    <span class="risk-percent">${riskStats.mediumRiskPercent}%</span>
                </div>
                <div class="risk-bar risk-high" style="width: ${riskStats.highRiskPercent}%" title="高风险: ${riskStats.highRiskCount}个客户">
                    <span class="risk-label">高</span>
                    <span class="risk-percent">${riskStats.highRiskPercent}%</span>
                </div>
            </div>
        </div>
        
        <div class="risk-insights">
            <div class="insight-item ${riskStats.highRiskCount > 0 ? 'insight-warning' : ''}">
                <i class="fas ${riskStats.highRiskCount > 0 ? 'fa-exclamation-triangle' : 'fa-check-circle'}"></i>
                <span>高风险客户占比 ${riskStats.highRiskPercent}%，${riskStats.highRiskCount > 0 ? '需要特别关注' : '无需特别关注'}</span>
            </div>
            <div class="insight-item">
                <i class="fas fa-info-circle"></i>
                <span>新增客户中，${riskStats.newCustomerRiskText}</span>
            </div>
        </div>
    `;
}

// 分析风险分布
function analyzeRiskDistribution(data) {
    // 计算各风险等级的客户数量
    const lowRiskCount = data.filter(c => c.riskLevel === 'low').length;
    const mediumRiskCount = data.filter(c => c.riskLevel === 'medium').length;
    const highRiskCount = data.filter(c => c.riskLevel === 'high').length;
    
    // 计算百分比
    const total = data.length;
    const lowRiskPercent = Math.round((lowRiskCount / total) * 100);
    const mediumRiskPercent = Math.round((mediumRiskCount / total) * 100);
    const highRiskPercent = Math.round((highRiskCount / total) * 100);
    
    // 分析新客户风险情况
    const newCustomers = data.filter(c => c.isNew);
    const newCustomerHighRisk = newCustomers.filter(c => c.riskLevel === 'high').length;
    const newCustomerRiskPercent = newCustomers.length > 0 ? Math.round((newCustomerHighRisk / newCustomers.length) * 100) : 0;
    
    let newCustomerRiskText;
    if (newCustomers.length === 0) {
        newCustomerRiskText = '无新增客户';
    } else if (newCustomerHighRisk === 0) {
        newCustomerRiskText = '无高风险客户';
    } else {
        newCustomerRiskText = `${newCustomerRiskPercent}% 为高风险客户`;
    }
    
    return {
        lowRiskCount,
        mediumRiskCount,
        highRiskCount,
        lowRiskPercent,
        mediumRiskPercent,
        highRiskPercent,
        newCustomerRiskText
    };
}

// 切换标签
function switchTab(tabId) {
    // 移除所有标签的active类
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 移除所有内容的active类
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 添加active类到选中的标签和内容
    document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

// 获取模拟导入数据
function getMockImportData() {
    // 模拟导入数据，实际项目中应从上传的Excel文件中读取
    // 这里提供一些示例数据，包括新客户和已有客户的更新数据
    return [
        { 
            name: '芜湖格力',
            type: '销售',
            date: '2023-05-05',
            amount: 150000,
            contact: '张经理',
            phone: '13812345678'
        },
        {
            name: '武汉格力',
            type: '销售',
            date: '2023-05-06',
            amount: 200000,
            contact: '李经理',
            phone: '13987654321'
        },
        { 
            name: '武汉格力',
            type: '回款',
            date: '2023-05-10',
            amount: 150000,
            contact: '李经理',
            phone: '13987654321'
        },
        {
            name: '浙江星星',
            type: '销售',
            date: '2023-05-07',
            amount: 350000,
            contact: '黄经理',
            phone: '13456789012',
            creditLimit: 500000,
            paymentTerms: 30
        },
        { 
            name: '武汉美的',
            type: '销售',
            date: '2023-05-02',
            amount: 1000000,
            contact: '钱经理',
            phone: '13512345678'
        },
        {
            name: '武汉美的',
            type: '回款',
            date: '2023-05-10',
            amount: 1500000,
            contact: '钱经理',
            phone: '13512345678'
        },
        { 
            name: '安徽星星',
            type: '销售',
            date: '2023-04-25',
            amount: 950000,
            contact: '孙经理',
            phone: '13567890123',
            creditLimit: 2000000,
            paymentTerms: 45
        },
        {
            name: '浙江华立',
            type: '销售',
            date: '2023-05-01',
            amount: 300000,
            contact: '陈经理',
            phone: '13612345678',
            creditLimit: 800000,
            paymentTerms: 30
        },
        { 
            name: '浙江星宝',
            type: '销售',
            date: '2023-04-28',
            amount: 1600000,
            contact: '林经理',
            phone: '13789012345',
            creditLimit: 2000000,
            paymentTerms: 30
        }
    ];
}

// 获取所有客户数据（模拟数据存储）
function getAllCustomerData() {
    // 在实际应用中，这里会从后端获取所有客户数据
    // 这里使用模拟数据
    return [
        {
            name: '芜湖格力',
            contact: '张经理',
            phone: '13812345678',
            creditRating: 'A',
            creditLimit: 1500000,
            usedCredit: 178490,
            receivable: 179670,
            paymentTerms: 30,
            lastPaymentDate: '2023-03-17',
            riskLevel: 'low',
            salesperson: '张经理',
            orders: [
                { date: '2023-04-01', type: '销售', amount: 178490, status: 'pending' },
                { date: '2023-03-17', type: '回款', amount: 120000, status: 'completed' },
                { date: '2023-02-15', type: '销售', amount: 120000, status: 'completed' }
            ]
        },
        { 
            name: '武汉格力',
            contact: '李经理',
            phone: '13987654321',
            creditRating: 'A',
            creditLimit: 1500000,
            usedCredit: 2170,
            receivable: 2170,
            paymentTerms: 30,
            lastPaymentDate: '2023-02-20',
            riskLevel: 'low',
            salesperson: '李经理',
            orders: [
                { date: '2023-04-01', type: '销售', amount: 2170, status: 'pending' },
                { date: '2023-03-01', type: '销售', amount: 5000, status: 'completed' },
                { date: '2023-02-20', type: '回款', amount: 5000, status: 'completed' }
            ]
        },
        { 
            name: '武汉美的',
            contact: '钱经理',
            phone: '13512345678',
            creditRating: 'D',
            creditLimit: 1200000,
            usedCredit: 890450,
            receivable: 905230,
            paymentTerms: 45,
            lastPaymentDate: '2022-11-20',
            riskLevel: 'high',
            salesperson: '钱经理',
            orders: [
                { date: '2023-01-15', type: '销售', amount: 890450, status: 'overdue' },
                { date: '2022-12-05', type: '销售', amount: 100000, status: 'overdue' },
                { date: '2022-11-20', type: '回款', amount: 50000, status: 'completed' }
            ]
        }
    ];
}

// 初始化数据导入模块
function initDataImportModule() {
    // 绑定文件选择按钮事件
    const fileSelectBtn = document.getElementById('file-select-btn');
    const fileInput = document.getElementById('file-input');
    
    if (fileSelectBtn && fileInput) {
        fileSelectBtn.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                // 更新文件信息显示
                updateFileInfo(file);
                // 重置错误信息
                resetImportError();
            }
        });
    }
    
    // 绑定拖放上传功能
    const fileUploadArea = document.querySelector('.file-upload-area');
    if (fileUploadArea) {
        // 阻止默认拖放行为
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileUploadArea.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        // 添加高亮效果
        ['dragenter', 'dragover'].forEach(eventName => {
            fileUploadArea.addEventListener(eventName, () => {
                fileUploadArea.classList.add('highlight');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            fileUploadArea.addEventListener(eventName, () => {
                fileUploadArea.classList.remove('highlight');
            }, false);
        });
        
        // 处理拖放文件
        fileUploadArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length > 0) {
                const file = files[0];
                
                // 更新文件输入框
                if (fileInput) {
                    // 创建一个新的DataTransfer对象
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    fileInput.files = dataTransfer.files;
                }
                
                // 更新文件信息显示
                updateFileInfo(file);
                // 重置错误信息
                resetImportError();
            }
        }, false);
    }
    
    // 绑定导入按钮事件
    const importBtn = document.getElementById('start-import-btn');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            if (fileInput && fileInput.files.length > 0) {
                handleFileImport(fileInput.files[0]);
            } else {
                showImportError('请先选择文件');
            }
        });
    }
    
    // 绑定取消按钮事件
    const cancelImportBtn = document.getElementById('cancel-import-btn');
    if (cancelImportBtn) {
        cancelImportBtn.addEventListener('click', () => {
            // 重置文件输入
            if (fileInput) {
                fileInput.value = '';
                const fileNameDisplay = document.getElementById('file-name-display');
                if (fileNameDisplay) {
                    fileNameDisplay.classList.remove('active');
                }
            }
            
            // 切换回导入数据标签
            switchTab('import-data');
            
            // 禁用确认导入按钮
            const confirmImportBtn = document.getElementById('confirm-import-btn');
            if (confirmImportBtn) {
                confirmImportBtn.disabled = true;
            }
        });
    }
    
    // 绑定确认导入按钮事件
    const confirmImportBtn = document.getElementById('confirm-import-btn');
    if (confirmImportBtn) {
        confirmImportBtn.addEventListener('click', () => {
            // 显示成功消息
            showImportSuccess('数据已成功导入系统！');
            
            // 切换到数据清洗标签
            switchTab('data-cleanup');
            
            // 在实际项目中，这里应该调用API保存导入的数据
        });
    }
    
    // 绑定标签切换事件
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // 绑定数据清洗标签切换事件
    const cleanupTabs = document.querySelectorAll('.cleanup-tab');
    cleanupTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 移除所有标签的active类
            cleanupTabs.forEach(t => t.classList.remove('active'));
            
            // 添加active类到当前标签
            this.classList.add('active');
            
            // 获取标签ID
            const tabId = this.getAttribute('data-cleanup-tab');
            
            // 隐藏所有内容
            document.querySelectorAll('.cleanup-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // 显示对应内容
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // 绑定确认清洗按钮事件
    const confirmCleanupBtn = document.getElementById('confirm-cleanup-btn');
    if (confirmCleanupBtn) {
        confirmCleanupBtn.addEventListener('click', () => {
            showImportSuccess('数据清洗完成，已保存到系统！');
            // 在实际项目中，这里应该调用API保存清洗后的数据
        });
    }
    
    // 绑定导出清洗报告按钮事件
    const exportCleanupBtn = document.getElementById('export-cleanup-btn');
    if (exportCleanupBtn) {
        exportCleanupBtn.addEventListener('click', () => {
            showImportSuccess('清洗报告已导出！');
            // 在实际项目中，这里应该提供导出功能
        });
    }
    
    // 绑定下载模板按钮事件
    const downloadTemplateBtn = document.getElementById('download-template-btn');
    if (downloadTemplateBtn) {
        downloadTemplateBtn.addEventListener('click', () => {
            showImportSuccess('模板已开始下载！');
            // 在实际项目中，这里应该提供模板下载功能
        });
    }
}

// 导出模块
window.dataImport = {
    initDataImportModule,
    handleFileImport,
    switchTab
};

// 页面加载完成后初始化数据导入模块
document.addEventListener('DOMContentLoaded', function() {
    initDataImportModule();
});