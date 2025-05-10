/**
 * 风险分析模块 - 客户信用风险管控系统
 */

// 初始化风险分析功能
document.addEventListener('DOMContentLoaded', function() {
  // 初始化风险详情查看按钮
  initRiskDetailButtons();
  
  // 初始化风险分析模态框选项卡
  initRiskAnalysisTabs();
  
  // 初始化模态框关闭按钮
  initModalClose();
  
  // 检查是否有从仪表盘传递过来的客户信息
  checkForSelectedCustomer();
});

// 检查是否有从仪表盘传递过来的客户信息
function checkForSelectedCustomer() {
  const selectedCustomer = sessionStorage.getItem('selectedCustomer');
  if (selectedCustomer) {
    // 获取其他相关信息
    const riskReason = sessionStorage.getItem('riskReason');
    const orderNumber = sessionStorage.getItem('orderNumber');
    
    // 清除会话存储
    sessionStorage.removeItem('selectedCustomer');
    sessionStorage.removeItem('riskReason');
    sessionStorage.removeItem('orderNumber');
    
    // 查找匹配客户的风险项
    const alertItems = document.querySelectorAll('.risk-alert-item');
    let matchFound = false;
    
    alertItems.forEach(item => {
      const itemTitle = item.querySelector('.risk-alert-title span').textContent;
      if (itemTitle.includes(selectedCustomer)) {
        // 高亮显示匹配的风险项
        item.style.boxShadow = '0 0 0 2px var(--primary-blue)';
        item.style.animation = 'pulse 1.5s infinite';
        
        // 添加脉动动画样式
        const style = document.createElement('style');
        style.textContent = `
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(0, 122, 255, 0.7); }
            70% { box-shadow: 0 0 0 6px rgba(0, 122, 255, 0); }
            100% { box-shadow: 0 0 0 0 rgba(0, 122, 255, 0); }
          }
        `;
        document.head.appendChild(style);
        
        // 滚动到该项
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // 获取详情信息
        const customerInfo = itemTitle.split(' - ');
        const riskLevel = customerInfo[1];
        const overdueAmount = item.querySelector('.risk-alert-detail-value').textContent;
        const creditRating = item.querySelectorAll('.risk-alert-detail-value')[1].textContent;
        
        // 显示通知
        showNotification(`已找到从仪表盘跳转的客户: ${selectedCustomer}，风险级别: ${riskLevel}`, 'info');
        
        // 延迟展示风险分析模态框，给用户时间看到高亮的风险项
        setTimeout(() => {
          showRiskAnalysisModal(selectedCustomer, riskLevel, overdueAmount, creditRating, riskReason, orderNumber);
        }, 1000);
        
        matchFound = true;
      }
    });
    
    if (!matchFound) {
      showNotification(`未找到客户"${selectedCustomer}"的风险记录，可能是新的风险事项`, 'warning');
      
      // 如果没有找到匹配的客户，但有风险原因，也显示风险分析模态框
      if (riskReason) {
        setTimeout(() => {
          // 使用默认值显示风险分析模态框
          showRiskAnalysisModal(selectedCustomer, '高风险预警', '¥未知', 'C级', riskReason, orderNumber);
        }, 1000);
      }
    }
  }
}

// 初始化风险详情查看按钮
function initRiskDetailButtons() {
  const detailButtons = document.querySelectorAll('.btn-secondary');
  
  detailButtons.forEach(button => {
    if (button.textContent.trim() === '查看详情') {
      button.addEventListener('click', function() {
        const alertItem = this.closest('.risk-alert-item');
        const customerInfo = alertItem.querySelector('.risk-alert-title span').textContent.split(' - ');
        const customerName = customerInfo[0];
        const riskLevel = customerInfo[1];
        
        // 获取风险等级和金额信息
        const overdueAmount = alertItem.querySelector('.risk-alert-detail-value').textContent;
        const creditRating = alertItem.querySelectorAll('.risk-alert-detail-value')[1].textContent;
        
        // 显示风险分析模态框
        showRiskAnalysisModal(customerName, riskLevel, overdueAmount, creditRating);
      });
    }
  });
}

// 显示风险分析模态框
function showRiskAnalysisModal(customerName, riskLevel, overdueAmount, creditRating, riskReason = '', orderNumber = '') {
  console.log('显示风险分析:', customerName, riskLevel);
  
  // 获取模态框元素
  const modal = document.getElementById('riskAnalysisModal');
  if (!modal) {
    console.error('找不到风险分析模态框');
    return;
  }
  
  // 设置客户信息
  document.getElementById('risk-customer-name').textContent = customerName;
  const ratingElem = document.getElementById('risk-customer-rating');
  ratingElem.textContent = creditRating;
  
  // 设置风险等级样式
  ratingElem.className = 'risk-badge';
  if (creditRating === 'A级') {
    ratingElem.classList.add('low');
  } else if (creditRating === 'B级') {
    ratingElem.classList.add('medium');
  } else if (creditRating === 'C级') {
    ratingElem.classList.add('high');
  } else if (creditRating === 'D级') {
    ratingElem.classList.add('extreme');
  }
  
  // 获取客户详细数据
  const customerData = getCustomerRiskData(customerName);
  
  // 填充授信情况
  document.getElementById('risk-credit-limit').textContent = '¥' + formatNumber(customerData.creditLimit);
  document.getElementById('risk-used-credit').textContent = '¥' + formatNumber(customerData.usedCredit);
  document.getElementById('risk-receivable').textContent = '¥' + formatNumber(customerData.receivable);
  document.getElementById('risk-overdue').textContent = overdueAmount;
  
  // 如果有订单号和风险原因，添加到风险因素中
  if (riskReason || orderNumber) {
    const riskFactorsTab = document.getElementById('risk-factors-tab');
    if (riskFactorsTab) {
      const firstRiskFactor = riskFactorsTab.querySelector('.risk-factor:first-child .risk-factor-body');
      if (firstRiskFactor) {
        const orderInfo = document.createElement('p');
        orderInfo.className = 'risk-order-info';
        orderInfo.innerHTML = `
          <strong>来自仪表盘的风险预警：</strong>
          ${orderNumber ? `<br>订单号: <span class="text-danger">${orderNumber}</span>` : ''}
          ${riskReason ? `<br>风险原因: <span class="text-danger">${riskReason}</span>` : ''}
        `;
        firstRiskFactor.insertBefore(orderInfo, firstRiskFactor.firstChild);
      }
    }
  }
  
  // 初始化回款历史图表
  initPaymentHistoryChart(customerData);
  
  // 初始化风险趋势图表
  initRiskTrendChart(customerData);
  
  // 打开模态框
  openModal(modal);
}

// 初始化风险分析模态框选项卡
function initRiskAnalysisTabs() {
  const tabs = document.querySelectorAll('.risk-analysis-tabs .tab');
  const tabContents = document.querySelectorAll('.risk-analysis-tabs .tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // 获取目标选项卡ID
      const targetId = this.getAttribute('data-tab');
      
      // 切换选项卡活动状态
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // 切换内容区域
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === targetId + '-tab') {
          content.classList.add('active');
        }
      });
    });
  });
}

// 初始化回款历史图表
function initPaymentHistoryChart(customerData) {
  const chartCanvas = document.getElementById('paymentHistoryChart');
  if (!chartCanvas) return;
  
  // 清除现有图表
  if (window.paymentHistoryChart) {
    window.paymentHistoryChart.destroy();
  }
  
  // 创建新图表
  window.paymentHistoryChart = new Chart(chartCanvas, {
    type: 'bar',
    data: {
      labels: customerData.paymentHistory.months,
      datasets: [
        {
          label: '订单金额',
          data: customerData.paymentHistory.orderAmounts,
          backgroundColor: 'rgba(0, 122, 255, 0.7)',
          borderColor: 'rgba(0, 122, 255, 1)',
          borderWidth: 1
        },
        {
          label: '回款金额',
          data: customerData.paymentHistory.paymentAmounts,
          backgroundColor: 'rgba(76, 217, 100, 0.7)',
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
              return '¥' + formatNumber(value);
            }
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              let value = context.raw || 0;
              return label + ': ¥' + formatNumber(value);
            }
          }
        }
      }
    }
  });
}

// 初始化风险趋势图表
function initRiskTrendChart(customerData) {
  const chartCanvas = document.getElementById('riskTrendChartDetail');
  if (!chartCanvas) return;
  
  // 清除现有图表
  if (window.riskTrendChartDetail) {
    window.riskTrendChartDetail.destroy();
  }
  
  // 创建新图表
  window.riskTrendChartDetail = new Chart(chartCanvas, {
    type: 'line',
    data: {
      labels: customerData.riskTrend.months,
      datasets: [
        {
          label: '信用评分趋势',
          data: customerData.riskTrend.scores,
          borderColor: 'rgba(255, 59, 48, 1)',
          backgroundColor: 'rgba(255, 59, 48, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 100,
          reverse: false,
          ticks: {
            callback: function(value) {
              return value + '分';
            }
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              const score = context.raw;
              let ratingLabel = '未知';
              
              if (score >= 80) ratingLabel = 'A级(低风险)';
              else if (score >= 60) ratingLabel = 'B级(中风险)';
              else if (score >= 40) ratingLabel = 'C级(高风险)';
              else ratingLabel = 'D级(极高风险)';
              
              return `评分: ${score}分 (${ratingLabel})`;
            }
          }
        }
      }
    }
  });
}

// 获取客户风险数据
function getCustomerRiskData(customerName) {
  // 模拟数据，实际项目中应从API获取
  const riskData = {
    '武汉美的': {
      creditLimit: 1200000,
      usedCredit: 890450,
      receivable: 905230,
      paymentHistory: {
        months: ['2022-09', '2022-10', '2022-11', '2022-12', '2023-01', '2023-02'],
        orderAmounts: [95000, 120000, 75000, 110000, 890450, 0],
        paymentAmounts: [95000, 120000, 75000, 60000, 0, 0]
      },
      riskTrend: {
        months: ['2022-09', '2022-10', '2022-11', '2022-12', '2023-01', '2023-02'],
        scores: [68, 63, 55, 48, 40, 33]
      }
    },
    '南京格力': {
      creditLimit: 1500000,
      usedCredit: 1940,
      receivable: 2030,
      paymentHistory: {
        months: ['2022-09', '2022-10', '2022-11', '2022-12', '2023-01', '2023-02'],
        orderAmounts: [30000, 45000, 35000, 50000, 30000, 1940],
        paymentAmounts: [30000, 45000, 35000, 50000, 28000, 0]
      },
      riskTrend: {
        months: ['2022-09', '2022-10', '2022-11', '2022-12', '2023-01', '2023-02'],
        scores: [78, 75, 72, 68, 59, 52]
      }
    },
    '苏州美的': {
      creditLimit: 1000000,
      usedCredit: 1250800,
      receivable: 1250800,
      paymentHistory: {
        months: ['2022-08', '2022-09', '2022-10', '2022-11', '2022-12', '2023-01'],
        orderAmounts: [120000, 150000, 200000, 350000, 430800, 0],
        paymentAmounts: [120000, 150000, 180000, 0, 0, 0]
      },
      riskTrend: {
        months: ['2022-08', '2022-09', '2022-10', '2022-11', '2022-12', '2023-01'],
        scores: [72, 65, 58, 42, 31, 25]
      }
    },
    '合肥格力': {
      creditLimit: 1500000,
      usedCredit: 16970,
      receivable: 16970,
      paymentHistory: {
        months: ['2022-09', '2022-10', '2022-11', '2022-12', '2023-01', '2023-02'],
        orderAmounts: [35000, 28000, 42000, 38000, 25000, 16970],
        paymentAmounts: [35000, 28000, 42000, 38000, 25000, 0]
      },
      riskTrend: {
        months: ['2022-09', '2022-10', '2022-11', '2022-12', '2023-01', '2023-02'],
        scores: [85, 83, 80, 76, 72, 68]
      }
    }
  };
  
  // 如果没有特定客户的数据，返回默认数据
  return riskData[customerName] || {
    creditLimit: 1000000,
    usedCredit: 500000,
    receivable: 520000,
    paymentHistory: {
      months: ['2022-09', '2022-10', '2022-11', '2022-12', '2023-01', '2023-02'],
      orderAmounts: [80000, 90000, 85000, 95000, 100000, 0],
      paymentAmounts: [80000, 90000, 85000, 95000, 50000, 0]
    },
    riskTrend: {
      months: ['2022-09', '2022-10', '2022-11', '2022-12', '2023-01', '2023-02'],
      scores: [75, 72, 68, 65, 60, 55]
    }
  };
}

// 格式化数字（添加千分位）
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 初始化模态框关闭按钮
function initModalClose() {
  const closeButtons = document.querySelectorAll('#riskAnalysisModal .close-btn');
  closeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const modal = this.closest('.modal');
      closeModal(modal);
    });
  });
  
  // 模态框背景点击关闭
  const riskAnalysisModal = document.getElementById('riskAnalysisModal');
  if (riskAnalysisModal) {
    riskAnalysisModal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeModal(this);
      }
    });
  }
  
  // 绑定操作按钮
  const actionButtons = document.querySelectorAll('#riskAnalysisModal .recommendation-actions button');
  actionButtons.forEach(button => {
    button.addEventListener('click', function() {
      const action = this.textContent.trim();
      const customerName = document.getElementById('risk-customer-name').textContent;
      
      switch (action) {
        case '下载报告':
          showNotification(`正在生成${customerName}的风险分析报告，请稍候...`, 'info');
          setTimeout(() => {
            showNotification(`${customerName}的风险分析报告已下载`, 'success');
          }, 1500);
          break;
          
        case '启动法务处理':
          showNotification(`正在启动对${customerName}的法务处理流程`, 'warning');
          setTimeout(() => {
            showNotification(`已成功启动${customerName}的法务处理流程`, 'success');
            closeModal(document.getElementById('riskAnalysisModal'));
          }, 1500);
          break;
          
        case '指派处理团队':
          showNotification(`正在为${customerName}的风险处理指派专项团队`, 'info');
          setTimeout(() => {
            showNotification(`已成功指派团队处理${customerName}的风险事项`, 'success');
            closeModal(document.getElementById('riskAnalysisModal'));
          }, 1500);
          break;
      }
    });
  });
}

// 打开模态框
function openModal(modal) {
  if (!modal) return;
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

// 关闭模态框
function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('show');
  document.body.style.overflow = '';
}

// 显示通知
function showNotification(message, type = 'info') {
  // 如果script.js中已定义showNotification函数，则使用该函数
  if (typeof window.showNotification === 'function') {
    window.showNotification(message, type);
    return;
  }
  
  // 否则使用自定义实现
  const notification = document.createElement('div');
  notification.className = 'notification ' + type;
  
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
  
  notification.innerHTML = `${icon} <span>${message}</span>`;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
      notification.parentNode.removeChild(notification);
    }, 300);
  }, 3000);
} 