/**
 * 客户信用风险管控系统
 * 通用脚本文件
 */

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  // 初始化仪表盘
  initDashboard();
  
  // 初始化图表
  initCharts();
  
  // 初始化事件监听
  initEventListeners();
  
  // 初始化模拟数据
  initMockData();
  
  // 初始化导航链接
  initNavLinks();
  
  // 初始化模态框
  initModals();
  
  // 初始化下拉菜单
  initDropdowns();
  
  // 初始化侧边栏折叠
  initSidebar();
});

// 初始化仪表盘
function initDashboard() {
  console.log('仪表盘初始化完成');
  // 这里可以添加仪表盘初始化代码
}

// 初始化图表
function initCharts() {
  // 风险分布图表
  const riskChartCtx = document.getElementById('riskChart');
  if (riskChartCtx) {
    new Chart(riskChartCtx, {
      type: 'doughnut',
      data: {
        labels: ['低风险', '中风险', '高风险'],
        datasets: [{
          data: [70, 20, 10],
          backgroundColor: ['#4cd964', '#ffcc00', '#ff3b30'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 15,
              padding: 15
            }
          }
        }
      }
    });
  }
}

// 初始化事件监听
function initEventListeners() {
  // 表格排序
  const tableHeaders = document.querySelectorAll('.data-table th[data-sort]');
  tableHeaders.forEach(header => {
    header.addEventListener('click', function() {
      const sortField = this.getAttribute('data-sort');
      sortTable(sortField);
    });
  });
  
  // 搜索功能
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      filterTable(this.value);
    });
  }
  
  // 绑定详情按钮点击事件
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
  
  // 绑定客户行点击事件
  const customerRows = document.querySelectorAll('tbody tr');
  if (customerRows.length > 0) {
    customerRows.forEach(row => {
      row.addEventListener('click', function() {
        const customerName = this.querySelector('td:first-child').textContent.trim();
        showCustomerDetail(customerName);
    });
  });
  }
  
  // 绑定添加客户按钮点击事件
  const addCustomerBtn = document.querySelector('.add-customer-btn');
  if (addCustomerBtn) {
    addCustomerBtn.addEventListener('click', function() {
      showAddCustomerForm();
    });
  }
  
  // 绑定人工录入按钮点击事件
  const manualAddBtn = document.getElementById('manualAddBtn');
  if (manualAddBtn) {
    manualAddBtn.addEventListener('click', function() {
      showAddCustomerForm();
    });
  }
  
  // 绑定表单提交事件
  const addCustomerForm = document.getElementById('add-customer-form');
  if (addCustomerForm) {
    addCustomerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(this);
      const customerData = {
        name: formData.get('customerName'),
        contact: formData.get('contactPerson'),
        phone: formData.get('contactPhone'),
        creditLimit: formData.get('creditLimit'),
        paymentTerms: formData.get('paymentTerms'),
        creditRating: formData.get('creditRating'),
        salesperson: formData.get('salesperson')
      };
      
      console.log('新增客户数据:', customerData);
      alert('客户添加成功!');
  
      // 关闭模态框
      const modal = document.getElementById('addCustomerModal');
      closeModal(modal);
      
      // 重置表单
      this.reset();
    });
  }
  
  // 全局点击事件，点击模态框外部关闭模态框
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal') && !e.target.classList.contains('active')) {
      closeModal(e.target);
  }
  });
}

// 表格排序功能
function sortTable(field) {
  // 实际项目中，这里应该调用后端API或处理前端数据
  console.log(`排序字段: ${field}`);
  
  // 更新排序图标
  const headers = document.querySelectorAll('.data-table th');
  headers.forEach(header => {
    const icon = header.querySelector('i');
    if (icon) {
      if (header.getAttribute('data-sort') === field) {
        // 切换排序方向
        if (icon.classList.contains('fa-sort-down')) {
          icon.classList.replace('fa-sort-down', 'fa-sort-up');
        } else {
          icon.classList.replace('fa-sort-up', 'fa-sort-down');
        }
      } else {
        // 重置其他列的图标
        icon.className = 'fas fa-sort';
      }
    }
  });
}

// 表格搜索过滤
function filterTable(keyword) {
  const rows = document.querySelectorAll('.data-table tbody tr');
  const lowerKeyword = keyword.toLowerCase();
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    if (text.includes(lowerKeyword)) {
      row.style.display = '';
    } else {
      row.style.display = 'none';
    }
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

// 显示添加客户表单
function showAddCustomerForm() {
  console.log('显示添加客户表单');
  
  const modal = document.getElementById('addCustomerModal');
  if (!modal) {
    console.error('找不到添加客户模态框');
    return;
  }
  
  // 重置表单
  const form = document.getElementById('add-customer-form');
  if (form) {
    form.reset();
  }
  
  // 显示模态框
  openModal(modal);
}

// 打开模态框
function openModal(modal) {
  if (!modal) return;
  
  // 支持两种模态框类名
  if (modal.classList.contains('modal')) {
    if (modal.classList.contains('show')) return;
    modal.classList.add('show');
  } else {
    if (modal.classList.contains('active')) return;
  modal.classList.add('active');
  }
  
  document.body.style.overflow = 'hidden'; // 防止背景滚动
}

// 关闭模态框
function closeModal(modal) {
  if (!modal) return;
  
  // 支持两种模态框类名
  if (modal.classList.contains('modal')) {
    modal.classList.remove('show');
  } else {
    modal.classList.remove('active');
  }
  
  document.body.style.overflow = ''; // 恢复背景滚动
}

// 格式化数字（添加千分位）
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 初始化模拟数据（实际项目中应从后端获取）
function initMockData() {
  // 在这里可以添加模拟数据初始化逻辑
  console.log('模拟数据已初始化');
}

// 风险评级逻辑
function calculateRiskLevel(customer) {
  // 根据需求文档中的评级标准计算风险等级
  // 这里是简化的逻辑，实际项目中应更复杂
  
  // 回款历史评分 (30%)
  let paymentScore = 0;
  if (customer.overdueCount === 0) {
    paymentScore = 30;
  } else if (customer.overdueCount <= 2 && customer.maxOverdueDays <= 30) {
    paymentScore = 20;
  } else if (customer.overdueCount <= 5 && customer.maxOverdueDays <= 60) {
    paymentScore = 10;
  }
  
  // 财务状况评分 (25%)
  let financialScore = 0;
  if (customer.financialHealth === 'good') {
    financialScore = 25;
  } else if (customer.financialHealth === 'average') {
    financialScore = 15;
  } else if (customer.financialHealth === 'poor') {
    financialScore = 5;
  }
  
  // 业务规模与稳定性 (20%)
  let businessScore = 0;
  if (customer.cooperationYears > 2) {
    businessScore = 20;
  } else if (customer.cooperationYears > 1) {
    businessScore = 15;
  } else {
    businessScore = 5;
  }
  
  // 行业地位与信誉 (15%)
  let industryScore = 0;
  if (customer.industryRanking === 'top') {
    industryScore = 15;
  } else if (customer.industryRanking === 'middle') {
    industryScore = 10;
  } else {
    industryScore = 5;
  }
  
  // 合作关系 (10%)
  let relationshipScore = 0;
  if (customer.relationship === 'excellent') {
    relationshipScore = 10;
  } else if (customer.relationship === 'good') {
    relationshipScore = 7;
  } else {
    relationshipScore = 3;
  }
  
  // 总分
  const totalScore = paymentScore + financialScore + businessScore + industryScore + relationshipScore;
  
  // 风险等级判定
  if (totalScore >= 80) {
    return 'A'; // 低风险
  } else if (totalScore >= 60) {
    return 'B'; // 中风险
  } else if (totalScore >= 40) {
    return 'C'; // 高风险
  } else {
    return 'D'; // 极高风险
  }
}

// 初始化导航链接
function initNavLinks() {
  // 获取当前页面URL
  const currentPage = window.location.pathname.split('/').pop();
  
  // 设置顶部导航活动状态
  const navItems = document.querySelectorAll('.nav-items .nav-item');
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    
    if ((currentPage === '' || currentPage === 'index.html' || currentPage === 'dashboard.html') && 
        (href === 'index.html' || href === 'dashboard.html')) {
      item.classList.add('active');
    } 
    else if (href === currentPage) {
      item.classList.add('active');
    }
    
    // 添加点击事件，增强交互体验
    item.addEventListener('click', function(e) {
      // 如果是当前页面，阻止默认行为并添加禁用类短暂时间
      if (href === currentPage) {
        e.preventDefault();
        this.classList.add('nav-item-disabled');
        setTimeout(() => {
          this.classList.remove('nav-item-disabled');
        }, 300);
      }
    });
  });
  
  // 微信小程序样式适配
  const isWechatMiniProgram = /miniProgram/i.test(navigator.userAgent) || 
                             window.wx && window.wx.miniProgram;
  
  if (isWechatMiniProgram) {
    // 添加微信小程序特有的样式类
    document.body.classList.add('wechat-mini-program');
    
    // 调整导航栏样式
    const topNav = document.querySelector('.top-nav');
    if (topNav) {
      topNav.classList.add('mini-program-nav');
    }
    
    // 适配微信小程序返回按钮
    if (currentPage !== 'dashboard.html' && currentPage !== 'index.html') {
      const backButton = document.createElement('div');
      backButton.className = 'mini-program-back';
      backButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
      backButton.addEventListener('click', function() {
        window.history.back();
      });
      
      const navBrand = document.querySelector('.nav-brand');
      if (navBrand && navBrand.parentNode) {
        navBrand.parentNode.insertBefore(backButton, navBrand);
      }
    }
  }
  
  console.log('导航链接初始化完成');
}

// 初始化模态框
function initModals() {
  // 选择所有模态框
  const modals = document.querySelectorAll('.modal');
  
  // 关闭按钮
  const closeButtons = document.querySelectorAll('.modal .close-btn, .modal .close-modal-btn');
  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.modal');
      closeModal(modal);
    });
  });
  
  // 点击模态框背景关闭
  modals.forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeModal(this);
      }
    });
  });
  
  // 添加ESC键关闭支持
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      modals.forEach(modal => {
        if (modal.classList.contains('show') || modal.classList.contains('active')) {
          closeModal(modal);
        }
      });
    }
  });
}

// 初始化下拉菜单
function initDropdowns() {
  const dropdowns = document.querySelectorAll('.dropdown');
  
  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    const menu = dropdown.querySelector('.dropdown-menu');
    
    if (trigger && menu) {
      trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });
      
      // 点击其他区域关闭下拉菜单
      document.addEventListener('click', function() {
        dropdown.classList.remove('active');
      });
      
      // 防止点击菜单内容关闭
      menu.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    }
  });
}

// 初始化侧边栏折叠
function initSidebar() {
  const toggleBtn = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.side-nav');
  
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', function() {
      sidebar.classList.toggle('collapsed');
      document.querySelector('.content-wrapper').classList.toggle('expanded');
    });
  }
}

// 标签页切换
function initTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      
      // 移除所有标签的active类
      tabs.forEach(t => t.classList.remove('active'));
      // 添加当前标签的active类
      this.classList.add('active');
      
      // 隐藏所有内容
      tabContents.forEach(content => content.classList.remove('active'));
      // 显示对应内容
      document.getElementById(tabId + '-tab').classList.add('active');
    });
  });
}

// 复制到剪贴板
function copyToClipboard(text) {
  const tempInput = document.createElement('input');
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
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

// 导出数据为CSV
function exportToCSV(headers, data, filename) {
  // 创建CSV内容
  let csvContent = headers.join(',') + '\n';
  
  data.forEach(row => {
    let rowData = [];
    headers.forEach(header => {
      // 处理数据中包含逗号的情况
      let cell = row[header] || '';
      if (cell.toString().includes(',')) {
        cell = `"${cell}"`;
      }
      rowData.push(cell);
    });
    csvContent += rowData.join(',') + '\n';
  });
  
  // 创建下载链接
  const link = document.createElement('a');
  link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
  link.download = filename;
  link.click();
}
