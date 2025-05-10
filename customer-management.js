// 客户管理页面脚本

document.addEventListener('DOMContentLoaded', function() {
    // 初始化客户管理页面功能
    initCustomerManagement();
});

// 初始化客户管理页面功能
function initCustomerManagement() {
    // 初始化搜索功能
    initSearch();
    
    // 初始化表格排序功能
    initTableSort();
    
    // 初始化分页功能
    initPagination();
    
    // 绑定添加客户按钮事件
    const addCustomerBtn = document.querySelector('.add-customer-btn');
    if (addCustomerBtn) {
        addCustomerBtn.addEventListener('click', function() {
            // 显示添加客户模态框
            const modal = document.getElementById('addCustomerModal');
            if (modal) openModal(modal);
        });
    }
    
    // 绑定导出数据按钮事件
    const exportDataBtn = document.querySelector('.export-data-btn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', function() {
            // 这里可以实现导出数据的功能
            showNotification('数据导出成功!', 'success');
        });
    }
    
    // 绑定高级筛选按钮事件
    const advancedFilterBtn = document.querySelector('.filter-btn');
    if (advancedFilterBtn) {
        advancedFilterBtn.addEventListener('click', function() {
            // 这里可以实现高级筛选的功能
            showNotification('筛选功能将在后续版本中实现', 'info');
        });
    }
    
    // 绑定导入数据按钮事件
    const importDataBtn = document.getElementById('importDataBtn');
    if (importDataBtn) {
        importDataBtn.addEventListener('click', function() {
            const importModal = document.getElementById('dataImportModal');
            if (importModal) {
                openModal(importModal);
                initImportModalFunctions();
            }
        });
    }
    
    // 绑定手动录入按钮事件
    const manualAddBtn = document.getElementById('manualAddBtn');
    if (manualAddBtn) {
        manualAddBtn.addEventListener('click', function() {
            const addCustomerModal = document.getElementById('addCustomerModal');
            if (addCustomerModal) {
                openModal(addCustomerModal);
            }
        });
    }
    
    // 绑定查看详情按钮点击事件
    const viewDetailBtns = document.querySelectorAll('.view-detail-btn');
    if (viewDetailBtns.length > 0) {
        viewDetailBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const row = this.closest('tr');
                const customerId = row.getAttribute('data-customer-id');
                const customerName = row.querySelector('td:first-child').textContent.trim();
                showCustomerDetail(customerName);
            });
        });
    }
    
    // 绑定客户行点击事件 - 新增功能
    const customerRows = document.querySelectorAll('tbody tr');
    if (customerRows.length > 0) {
        customerRows.forEach(row => {
            row.addEventListener('click', function() {
                const customerName = this.querySelector('td:first-child').textContent.trim();
                showCustomerDetail(customerName);
            });
        });
    }
    
    // 绑定编辑客户按钮事件
    const editCustomerBtns = document.querySelectorAll('.edit-btn');
    editCustomerBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡，避免触发行点击事件
            const row = this.closest('tr');
            const customerId = row.getAttribute('data-customer-id');
            const customerName = row.querySelector('td:first-child').textContent;
            
            // 这里可以实现编辑客户的功能
            showNotification(`准备编辑客户: ${customerName}`, 'info');
        });
    });
}

// 初始化导入模态框功能
function initImportModalFunctions() {
    // 获取模态框元素
    const importModal = document.getElementById('dataImportModal');
    if (!importModal) return;
    
    // 初始化标签切换
    const tabButtons = importModal.querySelectorAll('.import-tab');
    const tabContents = importModal.querySelectorAll('.import-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // 切换活动标签
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // 切换内容区域
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // 初始化返回按钮
    const backButtons = importModal.querySelectorAll('.back-btn');
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-target');
            
            // 查找并点击目标标签按钮
            const targetButton = importModal.querySelector(`.import-tab[data-tab="${targetTab}"]`);
            if (targetButton) {
                targetButton.click();
            }
        });
    });
    
    // 文件上传按钮模拟点击实际的文件输入框
    const fileUploadBtn = importModal.querySelector('.file-upload-btn');
    const fileInput = importModal.querySelector('#file-upload-input');
    
    if (fileUploadBtn && fileInput) {
        fileUploadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            fileInput.click();
        });
        
        // 监听文件选择变化
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                // 处理选中的文件
                handleFileImport(this.files[0]);
            }
        });
        
        // 拖放区域处理
        const uploadArea = importModal.querySelector('.upload-area');
        if (uploadArea) {
            // 阻止默认拖放行为
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                uploadArea.addEventListener(eventName, preventDefaults, false);
            });
            
            // 高亮拖放区域
            ['dragenter', 'dragover'].forEach(eventName => {
                uploadArea.addEventListener(eventName, function() {
                    uploadArea.classList.add('highlight');
                }, false);
            });
            
            // 移除高亮
            ['dragleave', 'drop'].forEach(eventName => {
                uploadArea.addEventListener(eventName, function() {
                    uploadArea.classList.remove('highlight');
                }, false);
            });
            
            // 处理拖放文件
            uploadArea.addEventListener('drop', function(e) {
                if (e.dataTransfer.files.length > 0) {
                    handleFileImport(e.dataTransfer.files[0]);
                }
            }, false);
        }
    }
    
    // 初始化确认导入按钮
    const confirmImportBtn = importModal.querySelector('#confirm-import-btn');
    if (confirmImportBtn) {
        confirmImportBtn.addEventListener('click', function() {
            // 显示加载状态
            showImportLoading();
            
            // 模拟处理导入
            setTimeout(() => {
                hideImportLoading();
                
                // 更新结果页面信息
                const resultTotal = document.getElementById('result-total');
                const resultSuccess = document.getElementById('result-success');
                const resultUpdated = document.getElementById('result-updated');
                const resultNew = document.getElementById('result-new');
                
                if (resultTotal) resultTotal.textContent = '9';
                if (resultSuccess) resultSuccess.textContent = '9';
                if (resultUpdated) resultUpdated.textContent = '4';
                if (resultNew) resultNew.textContent = '5';
                
                // 切换到结果页面
                switchImportTab('import-result');

                // 通知当前页面更新客户数据
                updateCustomerTable();
            }, 1500);
        });
    }
    
    // 查看更新数据按钮
    const viewUpdatedDataBtn = importModal.querySelector('#view-updated-data-btn');
    if (viewUpdatedDataBtn) {
        viewUpdatedDataBtn.addEventListener('click', function() {
            // 关闭导入模态框
            closeModal(importModal);
            
            // 显示通知
            showNotification('客户数据已更新，表格显示最新数据', 'success');
        });
    }
    
    // 绑定模态框关闭按钮
    const closeButtons = importModal.querySelectorAll('.close-btn, .close-modal-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            closeModal(importModal);
        });
    });
}

// 切换导入标签
function switchImportTab(tabId) {
    const tabButton = document.querySelector(`.import-tab[data-tab="${tabId}"]`);
    if (tabButton) {
        tabButton.click();
    }
}

// 更新客户表格数据（模拟）
function updateCustomerTable() {
    // 在实际应用中，这里会从API获取最新数据并更新表格
    // 这里只是简单模拟更新效果
    
    // 获取武汉美的行
    const wuhanMeidaRow = document.querySelector('tr[data-customer-id="5"]');
    if (wuhanMeidaRow) {
        // 更新已用额度和应收账款
        const usedCreditCell = wuhanMeidaRow.querySelector('td:nth-child(5)');
        const receivableCell = wuhanMeidaRow.querySelector('td:nth-child(6)');
        const lastPaymentCell = wuhanMeidaRow.querySelector('td:nth-child(7)');
        
        if (usedCreditCell && receivableCell && lastPaymentCell) {
            // 原数据：已用890,450，应收905,230
            // 更新：销售1,000,000，回款1,500,000
            // 结果：已用390,450，应收405,230
            usedCreditCell.textContent = '¥390,450';
            receivableCell.textContent = '¥405,230';
            lastPaymentCell.textContent = '2023-05-10';
            
            // 更新颜色和CSS类（原为极高风险）
            wuhanMeidaRow.className = 'risk-medium';
            
            // 更新风险等级图标（原为D级）
            const riskBadge = wuhanMeidaRow.querySelector('.risk-badge');
            if (riskBadge) {
                riskBadge.className = 'risk-badge medium';
                riskBadge.textContent = 'B级';
            }
        }
    }
    
    // 添加新客户浙江星星
    const tableBody = document.querySelector('.data-table tbody');
    if (tableBody) {
        // 创建新行
        const newRow = document.createElement('tr');
        newRow.className = 'risk-medium';
        newRow.setAttribute('data-customer-id', '6');
        
        // 设置单元格内容
        newRow.innerHTML = `
            <td>浙江星星</td>
            <td>黄经理</td>
            <td>13456789012</td>
            <td>¥500,000</td>
            <td>¥350,000</td>
            <td>¥350,000</td>
            <td>-</td>
            <td>30天</td>
            <td><span class="risk-badge medium">B级</span></td>
            <td>
                <button class="btn-icon view-detail-btn" data-customer-name="浙江星星">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon edit-btn">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon rating-adjust-btn">
                    <i class="fas fa-star"></i>
                </button>
            </td>
        `;
        
        // 添加到表格
        tableBody.appendChild(newRow);
        
        // 绑定事件
        const viewBtn = newRow.querySelector('.view-detail-btn');
        viewBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            showCustomerDetail('浙江星星');
        });
        
        const editBtn = newRow.querySelector('.edit-btn');
        editBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showNotification('准备编辑客户: 浙江星星', 'info');
        });
        
        // 行点击事件
        newRow.addEventListener('click', function() {
            showCustomerDetail('浙江星星');
        });
    }
    
    // 更新页脚信息
    const pageInfo = document.querySelector('.page-info');
    if (pageInfo) {
        pageInfo.textContent = '显示 1-6 条，共 133 条';
    }
}

// 阻止默认事件
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
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

// 初始化搜索功能
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const tableRows = document.querySelectorAll('.data-table tbody tr');
            
            tableRows.forEach(row => {
                const customerName = row.querySelector('td:first-child').textContent.toLowerCase();
                const contactName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                const contactPhone = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
                
                // 如果搜索词匹配客户名称、联系人或电话，则显示该行
                if (customerName.includes(searchTerm) || contactName.includes(searchTerm) || contactPhone.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
}

// 初始化表格排序功能
function initTableSort() {
    const sortableHeaders = document.querySelectorAll('.data-table th[data-sort]');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const sortBy = this.getAttribute('data-sort');
            const tableBody = document.querySelector('.data-table tbody');
            const rows = Array.from(tableBody.querySelectorAll('tr'));
            
            // 移除所有排序图标的类
            sortableHeaders.forEach(h => {
                const icon = h.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-sort';
                }
            });
            
            // 获取当前排序方向
            const currentIcon = this.querySelector('i');
            const isAscending = currentIcon.className === 'fas fa-sort' || currentIcon.className === 'fas fa-sort-down';
            
            // 更新排序图标
            currentIcon.className = isAscending ? 'fas fa-sort-up' : 'fas fa-sort-down';
            
            // 根据不同的列进行排序
            rows.sort((a, b) => {
                let aValue, bValue;
                
                switch(sortBy) {
                    case 'name':
                    case 'contact':
                    case 'phone':
                        // 文本排序
                        const columnIndex = sortBy === 'name' ? 0 : (sortBy === 'contact' ? 1 : 2);
                        aValue = a.querySelectorAll('td')[columnIndex].textContent;
                        bValue = b.querySelectorAll('td')[columnIndex].textContent;
                        return isAscending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                    
                    case 'credit':
                    case 'used':
                    case 'receivable':
                        // 金额排序
                        const moneyIndex = sortBy === 'credit' ? 3 : (sortBy === 'used' ? 4 : 5);
                        aValue = parseFloat(a.querySelectorAll('td')[moneyIndex].textContent.replace(/[^\d.-]/g, ''));
                        bValue = parseFloat(b.querySelectorAll('td')[moneyIndex].textContent.replace(/[^\d.-]/g, ''));
                        return isAscending ? aValue - bValue : bValue - aValue;
                    
                    case 'lastPayment':
                        // 日期排序
                        aValue = new Date(a.querySelectorAll('td')[6].textContent);
                        bValue = new Date(b.querySelectorAll('td')[6].textContent);
                        return isAscending ? aValue - bValue : bValue - aValue;
                    
                    case 'terms':
                        // 数字排序
                        aValue = parseInt(a.querySelectorAll('td')[7].textContent);
                        bValue = parseInt(b.querySelectorAll('td')[7].textContent);
                        return isAscending ? aValue - bValue : bValue - aValue;
                    
                    case 'rating':
                        // 风险等级排序
                        const riskMap = { 'A级': 1, 'B级': 2, 'C级': 3, 'D级': 4 };
                        aValue = riskMap[a.querySelector('.risk-badge').textContent];
                        bValue = riskMap[b.querySelector('.risk-badge').textContent];
                        return isAscending ? aValue - bValue : bValue - aValue;
                    
                    default:
                        return 0;
                }
            });
            
            // 重新排列表格行
            rows.forEach(row => tableBody.appendChild(row));
        });
    });
}

// 初始化分页功能
function initPagination() {
    const pageBtns = document.querySelectorAll('.page-btn');
    pageBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // 移除所有页码按钮的活动状态
            pageBtns.forEach(b => b.classList.remove('active'));
            
            // 如果是数字页码按钮，则添加活动状态
            if (!this.querySelector('i')) {
                this.classList.add('active');
            }
            
            // 这里可以实现实际的分页功能
            // 目前只是模拟页面切换效果
        });
    });
}

// 显示客户详情
function showCustomerDetail(customerName) {
    console.log('显示客户详情:', customerName);
    
    // 模拟获取客户数据
    const customerData = getCustomerData(customerName);
    
    // 获取模态框元素
    const modal = document.getElementById('customerDetailModal');
    if (!modal) {
        console.error('找不到客户详情模态框');
        return;
    }
    
    // 填充基本信息
    document.getElementById('detail-customer-name').textContent = customerData.name;
    document.getElementById('detail-contact-person').textContent = customerData.contact;
    document.getElementById('detail-contact-phone').textContent = customerData.phone;
    document.getElementById('detail-payment-terms').textContent = customerData.paymentTerms + '天';
    document.getElementById('detail-salesperson').textContent = customerData.salesperson;
    
    // 设置信用评级
    const ratingElem = document.getElementById('detail-credit-rating');
    ratingElem.textContent = customerData.creditRating + '级';
    ratingElem.className = 'risk-badge';
    switch (customerData.creditRating) {
        case 'A':
            ratingElem.classList.add('low');
            break;
        case 'B':
            ratingElem.classList.add('medium');
            break;
        case 'C':
            ratingElem.classList.add('high');
            break;
        case 'D':
            ratingElem.classList.add('extreme');
            break;
    }
    
    // 填充授信情况
    document.getElementById('detail-credit-limit').textContent = '¥' + formatNumber(customerData.creditLimit);
    document.getElementById('detail-used-credit').textContent = '¥' + formatNumber(customerData.usedCredit);
    document.getElementById('detail-receivable').textContent = '¥' + formatNumber(customerData.receivable);
    
    // 计算授信使用率
    const usageRate = (customerData.usedCredit / customerData.creditLimit * 100).toFixed(2) + '%';
    document.getElementById('detail-credit-usage').textContent = usageRate;
    
    // 填充历史订单
    const ordersContainer = document.getElementById('detail-orders');
    ordersContainer.innerHTML = '';
    
    customerData.orders.forEach(order => {
        const row = document.createElement('tr');
        
        const dateCell = document.createElement('td');
        dateCell.textContent = order.date;
        row.appendChild(dateCell);
        
        const typeCell = document.createElement('td');
        typeCell.textContent = order.type;
        row.appendChild(typeCell);
        
        const amountCell = document.createElement('td');
        amountCell.textContent = '¥' + formatNumber(order.amount);
        row.appendChild(amountCell);
        
        const statusCell = document.createElement('td');
        const statusBadge = document.createElement('span');
        statusBadge.className = 'status-badge';
        
        switch (order.status) {
            case 'completed':
                statusBadge.classList.add('completed');
                statusBadge.textContent = '已完成';
                break;
            case 'pending':
                statusBadge.classList.add('pending');
                statusBadge.textContent = '待付款';
                break;
            case 'overdue':
                statusBadge.classList.add('overdue');
                statusBadge.textContent = '已逾期';
                break;
        }
        
        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);
        
        ordersContainer.appendChild(row);
    });
    
    // 显示模态框
    openModal(modal);
}

// 获取客户数据（模拟）
function getCustomerData(customerName) {
    // 模拟数据，实际项目中应从后端API获取
    const customersData = {
        '芜湖格力': {
            name: '芜湖格力',
            contact: '张经理',
            phone: '13812345678',
            creditRating: 'A',
            creditLimit: 1500000,
            usedCredit: 178490,
            receivable: 179670,
            paymentTerms: 30,
            salesperson: '张经理',
            orders: [
                { date: '2023-04-01', type: '销售', amount: 178490, status: 'completed' },
                { date: '2023-03-17', type: '回款', amount: 120000, status: 'completed' },
                { date: '2023-02-15', type: '销售', amount: 120000, status: 'completed' }
            ]
        },
        // ... existing customer data ...
    };
    
    return customersData[customerName] || {
        name: customerName,
        contact: '未知',
        phone: '未知',
        creditRating: '未知',
        creditLimit: 0,
        usedCredit: 0,
        receivable: 0,
        paymentTerms: 0,
        salesperson: '未知',
        orders: []
    };
}

// 格式化数字（添加千分位）
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 打开模态框
function openModal(modal) {
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
}

// 关闭模态框
function closeModal(modal) {
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}

// 显示通知
function showNotification(message, type = 'info', duration = 3000) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    
    // 添加图标
    let icon = '';
    switch(type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }
    
    // 设置内容
    notification.innerHTML = `${icon} <span>${message}</span>`;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // 自动关闭
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        
        // 移除元素
        setTimeout(() => {
            notification.parentNode.removeChild(notification);
        }, 300);
    }, duration);
}