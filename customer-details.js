// 客户详情处理模块

document.addEventListener('DOMContentLoaded', function() {
    // 初始化客户详情功能
    initCustomerDetails();
});

// 初始化客户详情相关功能
function initCustomerDetails() {
    // 绑定评级详情按钮点击事件
    const ratingDetailBtns = document.querySelectorAll('.rating-detail-btn');
    ratingDetailBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // 阻止事件冒泡
            const rating = this.getAttribute('data-rating');
            showRatingDetails(rating);
        });
    });

    // 绑定客户详情按钮点击事件
    const customerDetailBtns = document.querySelectorAll('.btn-icon');
    customerDetailBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            const customerId = row.getAttribute('data-customer-id');
            const customerName = row.querySelector('td:first-child').textContent.trim();
            showCustomerDetail(customerName);
        });
    });

    // 绑定关闭模态框按钮事件
    const closeButtons = document.querySelectorAll('.close-btn, .close-modal-btn');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
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
    
    // 添加业务往来部分（如果不存在则添加）
    const modalBody = modal.querySelector('.modal-body');
    let businessSection = modalBody.querySelector('.business-history-section');
    
    if (!businessSection) {
        // 创建业务往来部分
        businessSection = document.createElement('div');
        businessSection.className = 'info-section business-history-section';
        businessSection.innerHTML = `
            <h3 class="section-title">业务往来分析</h3>
            
            <div class="business-summary">
                <div class="business-stat">
                    <div class="business-stat-value">${customerData.businessSummary.totalYears}</div>
                    <div class="business-stat-label">合作年限</div>
                </div>
                <div class="business-stat">
                    <div class="business-stat-value">¥${formatNumber(customerData.businessSummary.totalAmount)}</div>
                    <div class="business-stat-label">累计交易额</div>
                </div>
                <div class="business-stat">
                    <div class="business-stat-value">${customerData.businessSummary.orderCount}</div>
                    <div class="business-stat-label">累计订单数</div>
                </div>
            </div>
            
            <div class="business-year-trend">
                <div class="trend-title">
                    <span>交易历史趋势</span>
                    <div class="trend-controls">
                        <button class="trend-control active" data-period="year">年度</button>
                        <button class="trend-control" data-period="quarter">季度</button>
                        <button class="trend-control" data-period="month">月度</button>
                    </div>
                </div>
                <div class="business-chart-container">
                    <canvas id="businessHistoryChart"></canvas>
                </div>
            </div>
        `;
        
        modalBody.appendChild(businessSection);
        
        // 绑定趋势图切换事件
        const trendControls = businessSection.querySelectorAll('.trend-control');
        trendControls.forEach(control => {
            control.addEventListener('click', function() {
                // 移除所有active类
                trendControls.forEach(btn => btn.classList.remove('active'));
                // 添加当前按钮的active类
                this.classList.add('active');
                
                const period = this.getAttribute('data-period');
                updateBusinessChart(customerData, period);
            });
        });
        
        // 初始化业务往来图表
        setTimeout(() => {
            initBusinessChart(customerData);
        }, 300);
    } else {
        // 更新现有业务往来部分数据
        const statValues = businessSection.querySelectorAll('.business-stat-value');
        statValues[0].textContent = customerData.businessSummary.totalYears;
        statValues[1].textContent = '¥' + formatNumber(customerData.businessSummary.totalAmount);
        statValues[2].textContent = customerData.businessSummary.orderCount;
        
        // 更新图表
        updateBusinessChart(customerData, 'year');
    }
    
    // 显示模态框
    openModal(modal);
}

// 初始化业务往来图表
function initBusinessChart(customerData) {
    const chartCanvas = document.getElementById('businessHistoryChart');
    if (!chartCanvas) return;
    
    // 销毁现有图表（如果存在）
    if (window.businessChart) {
        window.businessChart.destroy();
    }
    
    // 创建新图表
    window.businessChart = new Chart(chartCanvas, {
        type: 'bar',
        data: {
            labels: customerData.businessHistory.year.labels,
            datasets: [
                {
                    label: '销售额',
                    data: customerData.businessHistory.year.sales,
                    backgroundColor: 'rgba(0, 122, 255, 0.6)',
                    borderColor: 'rgba(0, 122, 255, 1)',
                    borderWidth: 1
                },
                {
                    label: '回款额',
                    data: customerData.businessHistory.year.payments,
                    backgroundColor: 'rgba(76, 217, 100, 0.6)',
                    borderColor: 'rgba(76, 217, 100, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '¥' + value / 10000 + '万';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ¥' + formatNumber(context.raw);
                        }
                    }
                }
            }
        }
    });
}

// 更新业务往来图表
function updateBusinessChart(customerData, period) {
    if (!window.businessChart) {
        initBusinessChart(customerData);
        return;
    }
    
    const chart = window.businessChart;
    const historyData = customerData.businessHistory[period];
    
    chart.data.labels = historyData.labels;
    chart.data.datasets[0].data = historyData.sales;
    chart.data.datasets[1].data = historyData.payments;
    
    chart.update();
}

// 显示评级详情
function showRatingDetails(rating) {
    // 使用信用评级模块显示评级详情
    if (window.creditRating && window.creditRating.showCreditRatingDetails) {
        window.creditRating.showCreditRatingDetails(rating);
    } else {
        console.error('信用评级模块未加载');
    }
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
            ],
            businessSummary: {
                totalYears: 5,
                totalAmount: 2835000,
                orderCount: 42
            },
            businessHistory: {
                year: {
                    labels: ['2019', '2020', '2021', '2022', '2023'],
                    sales: [320000, 480000, 520000, 750000, 765000],
                    payments: [320000, 480000, 520000, 670000, 600000]
                },
                quarter: {
                    labels: ['Q1-22', 'Q2-22', 'Q3-22', 'Q4-22', 'Q1-23', 'Q2-23'],
                    sales: [180000, 150000, 200000, 220000, 240000, 245000],
                    payments: [170000, 150000, 180000, 170000, 220000, 180000]
                },
                month: {
                    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                    sales: [90000, 70000, 80000, 85000, 75000, 85000],
                    payments: [80000, 65000, 75000, 70000, 60000, 50000]
                }
            }
        },
        '武汉格力': {
            name: '武汉格力',
            contact: '李经理',
            phone: '13987654321',
            creditRating: 'A',
            creditLimit: 1500000,
            usedCredit: 2170,
            receivable: 2170,
            paymentTerms: 30,
            salesperson: '李经理',
            orders: [
                { date: '2023-04-01', type: '销售', amount: 2170, status: 'completed' },
                { date: '2023-03-01', type: '销售', amount: 5000, status: 'completed' },
                { date: '2023-02-20', type: '回款', amount: 5000, status: 'completed' }
            ],
            businessSummary: {
                totalYears: 3,
                totalAmount: 1230000,
                orderCount: 28
            },
            businessHistory: {
                year: {
                    labels: ['2021', '2022', '2023'],
                    sales: [280000, 640000, 310000],
                    payments: [280000, 640000, 290000]
                },
                quarter: {
                    labels: ['Q1-22', 'Q2-22', 'Q3-22', 'Q4-22', 'Q1-23', 'Q2-23'],
                    sales: [120000, 180000, 160000, 180000, 210000, 100000],
                    payments: [120000, 170000, 160000, 190000, 190000, 100000]
                },
                month: {
                    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                    sales: [65000, 70000, 75000, 45000, 30000, 25000],
                    payments: [60000, 65000, 65000, 45000, 30000, 25000]
                }
            }
        },
        '合肥格力': {
            name: '合肥格力',
            contact: '王经理',
            phone: '13765432198',
            creditRating: 'B',
            creditLimit: 1500000,
            usedCredit: 16970,
            receivable: 16970,
            paymentTerms: 30,
            salesperson: '王经理',
            orders: [
                { date: '2023-03-15', type: '销售', amount: 16970, status: 'pending' },
                { date: '2023-02-10', type: '销售', amount: 20000, status: 'completed' },
                { date: '2023-01-25', type: '回款', amount: 20000, status: 'completed' }
            ],
            businessSummary: {
                totalYears: 2,
                totalAmount: 980000,
                orderCount: 22
            },
            businessHistory: {
                year: {
                    labels: ['2022', '2023'],
                    sales: [650000, 330000],
                    payments: [620000, 290000]
                },
                quarter: {
                    labels: ['Q1-22', 'Q2-22', 'Q3-22', 'Q4-22', 'Q1-23', 'Q2-23'],
                    sales: [140000, 150000, 170000, 190000, 180000, 150000],
                    payments: [130000, 150000, 160000, 180000, 150000, 140000]
                },
                month: {
                    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                    sales: [50000, 60000, 70000, 50000, 50000, 50000],
                    payments: [40000, 50000, 60000, 50000, 45000, 45000]
                }
            }
        },
        '南京格力': {
            name: '南京格力',
            contact: '赵经理',
            phone: '13698765432',
            creditRating: 'C',
            creditLimit: 1500000,
            usedCredit: 1940,
            receivable: 2030,
            paymentTerms: 30,
            salesperson: '赵经理',
            orders: [
                { date: '2023-02-28', type: '销售', amount: 1940, status: 'overdue' },
                { date: '2023-01-15', type: '销售', amount: 3000, status: 'completed' },
                { date: '2022-12-20', type: '回款', amount: 3000, status: 'completed' }
            ],
            businessSummary: {
                totalYears: 1,
                totalAmount: 620000,
                orderCount: 15
            },
            businessHistory: {
                year: {
                    labels: ['2022', '2023'],
                    sales: [520000, 100000],
                    payments: [480000, 60000]
                },
                quarter: {
                    labels: ['Q1-22', 'Q2-22', 'Q3-22', 'Q4-22', 'Q1-23', 'Q2-23'],
                    sales: [120000, 130000, 140000, 130000, 65000, 35000],
                    payments: [110000, 120000, 130000, 120000, 40000, 20000]
                },
                month: {
                    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                    sales: [25000, 20000, 20000, 15000, 10000, 10000],
                    payments: [15000, 15000, 10000, 10000, 5000, 5000]
                }
            }
        },
        '武汉美的': {
            name: '武汉美的',
            contact: '钱经理',
            phone: '13512345678',
            creditRating: 'D',
            creditLimit: 1200000,
            usedCredit: 890450,
            receivable: 905230,
            paymentTerms: 45,
            salesperson: '钱经理',
            orders: [
                { date: '2023-01-15', type: '销售', amount: 890450, status: 'overdue' },
                { date: '2022-12-05', type: '销售', amount: 100000, status: 'overdue' },
                { date: '2022-11-20', type: '回款', amount: 50000, status: 'completed' }
            ],
            businessSummary: {
                totalYears: 2,
                totalAmount: 1850000,
                orderCount: 18
            },
            businessHistory: {
                year: {
                    labels: ['2022', '2023'],
                    sales: [850000, 1000000],
                    payments: [520000, 50000]
                },
                quarter: {
                    labels: ['Q1-22', 'Q2-22', 'Q3-22', 'Q4-22', 'Q1-23', 'Q2-23'],
                    sales: [200000, 220000, 180000, 250000, 650000, 350000],
                    payments: [180000, 190000, 150000, 0, 50000, 0]
                },
                month: {
                    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                    sales: [450000, 120000, 80000, 180000, 120000, 50000],
                    payments: [50000, 0, 0, 0, 0, 0]
                }
            }
        }
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
        orders: [],
        businessSummary: {
            totalYears: 0,
            totalAmount: 0,
            orderCount: 0
        },
        businessHistory: {
            year: {
                labels: [],
                sales: [],
                payments: []
            },
            quarter: {
                labels: [],
                sales: [],
                payments: []
            },
            month: {
                labels: [],
                sales: [],
                payments: []
            }
        }
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