// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  // 检测是否在微信小程序环境中
  const isWechatMiniProgram = /miniProgram/i.test(navigator.userAgent) || 
                             window.wx && window.wx.miniProgram;
  
  // 初始化图表
  initCharts(isWechatMiniProgram);
  
  // 初始化数据分析摘要图表
  initAnalysisSummaryCharts();
  
  // 绑定事件
  bindEvents();
  
  // 初始化数据表格
  initDataTable();
  
  // 显示风险预警提示
  setTimeout(() => {
    showRiskWarnings();
  }, 1000);
});

// 初始化图表
function initCharts(isWechatMiniProgram = false) {
  // 设置微信小程序环境下的图表样式
  let chartOptions = {};
  
  if (isWechatMiniProgram) {
    // 为微信小程序优化的图表样式
    chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            padding: 10,
            font: {
              size: 11
            }
          }
        },
        tooltip: {
          enabled: true,
          displayColors: false,
          titleFont: {
            size: 12
          },
          bodyFont: {
            size: 11
          },
          padding: 8
        }
      }
    };
  }
  
  // 风险分布图表
  const riskChartCtx = document.getElementById('riskChart');
  if (riskChartCtx) {
    const riskChart = new Chart(riskChartCtx, {
      type: 'doughnut',
      data: {
        labels: ['低风险(A级)', '中风险(B级)', '高风险(C级)', '极高风险(D级)'],
        datasets: [{
          data: [42, 56, 18, 12],
          backgroundColor: ['#4cd964', '#ffcc00', '#ff9500', '#ff3b30'],
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
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} 客户 (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
  
  // 授信使用分析图表
  const creditChartCtx = document.getElementById('creditUseChart');
  if (creditChartCtx) {
    const creditChart = new Chart(creditChartCtx, {
      type: 'bar',
      data: {
        labels: ['1月', '2月', '3月', '4月'],
        datasets: [{
          label: '授信使用',
          data: [62, 58, 65, 71],
          backgroundColor: 'rgba(0, 122, 255, 0.7)',
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `授信使用率: ${context.raw}%`;
              }
            }
          }
        }
      }
    });
  }
}

// 初始化数据分析摘要图表
function initAnalysisSummaryCharts() {
  // 客户集中度分析图表
  const customerConcentrationCtx = document.getElementById('customerConcentrationChart');
  if (customerConcentrationCtx) {
    new Chart(customerConcentrationCtx, {
      type: 'pie',
      data: {
        labels: ['前5大客户', '其他客户'],
        datasets: [{
          data: [65, 35],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              padding: 10,
              font: {
                size: 10
              }
            }
          }
        }
      }
    });
  }
  
  // 账款回收趋势图表
  const paymentTrendCtx = document.getElementById('paymentTrendChart');
  if (paymentTrendCtx) {
    new Chart(paymentTrendCtx, {
      type: 'line',
      data: {
        labels: ['1月', '2月', '3月', '4月', '5月'],
        datasets: [{
          label: '回款率',
          data: [92, 94, 90, 87, 85],
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            min: 80,
            max: 100,
            ticks: {
              callback: function(value) {
                return value + '%';
              },
              font: {
                size: 10
              }
            }
          },
          x: {
            ticks: {
              font: {
                size: 10
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }
  
  // 信用风险趋势图表
  const riskTrendCtx = document.getElementById('riskTrendChart');
  if (riskTrendCtx) {
    new Chart(riskTrendCtx, {
      type: 'bar',
      data: {
        labels: ['1月', '2月', '3月', '4月', '5月'],
        datasets: [{
          label: 'C/D级客户占比',
          data: [15, 18, 20, 22, 24],
          backgroundColor: 'rgba(255, 99, 132, 0.7)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 30,
            ticks: {
              callback: function(value) {
                return value + '%';
              },
              font: {
                size: 10
              }
            }
          },
          x: {
            ticks: {
              font: {
                size: 10
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }
  
  // 行业分布图表
  const industryDistributionCtx = document.getElementById('industryDistributionChart');
  if (industryDistributionCtx) {
    new Chart(industryDistributionCtx, {
      type: 'doughnut',
      data: {
        labels: ['家电行业', '电子产品', '工业应用', '其他'],
        datasets: [{
          data: [72, 15, 8, 5],
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              padding: 8,
              font: {
                size: 10
              }
            }
          }
        }
      }
    });
  }
}

// 绑定事件
function bindEvents() {
  // 绑定时间范围选择器事件
  const timeRangeSelect = document.getElementById('timeRange');
  if (timeRangeSelect) {
    timeRangeSelect.addEventListener('change', function() {
      refreshDashboardData(this.value);
    });
  }
  
  // 绑定刷新按钮事件
  const refreshBtn = document.querySelector('.btn-refresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
      const timeRange = document.getElementById('timeRange').value;
      refreshDashboardData(timeRange);
      
      // 显示刷新动画
      this.querySelector('i').classList.add('fa-spin');
      setTimeout(() => {
        this.querySelector('i').classList.remove('fa-spin');
      }, 1000);
      
      // 显示成功通知
      showNotification('数据已刷新', 'success');
    });
  }
  
  // 绑定生成报告按钮事件
  const reportBtn = document.getElementById('generateReportBtn');
  if (reportBtn) {
    reportBtn.addEventListener('click', function() {
      showNotification('正在生成报告，请稍候...', 'info');
      
      // 模拟报告生成延迟
      setTimeout(() => {
        showNotification('报告生成成功！', 'success');
      }, 2000);
    });
  }
  
  // 绑定评级标准按钮事件
  const ratingCriteriaBtn = document.getElementById('viewRatingCriteriaBtn');
  if (ratingCriteriaBtn) {
    ratingCriteriaBtn.addEventListener('click', function() {
      showCreditRatingCriteria();
    });
  }
}

// 初始化数据表格
function initDataTable() {
  // 绑定表格排序事件
  const tableHeaders = document.querySelectorAll('.data-table th[data-sort]');
  tableHeaders.forEach(header => {
    header.addEventListener('click', function() {
      const sortField = this.getAttribute('data-sort');
      sortTable(sortField);
    });
  });
  
  // 绑定客户行点击事件
  const customerRows = document.querySelectorAll('.data-table tbody tr');
  customerRows.forEach(row => {
    row.addEventListener('click', function() {
      const customerName = this.querySelector('td:first-child').textContent;
      showCustomerDetail(customerName);
    });
  });
  
  // 绑定评级详情按钮事件
  const ratingDetailBtns = document.querySelectorAll('.rating-detail-btn');
  ratingDetailBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation(); // 阻止事件冒泡
      const rating = this.getAttribute('data-rating');
      showCreditRatingDetail(rating);
    });
  });
}

// 刷新仪表盘数据
function refreshDashboardData(timeRange) {
  console.log(`刷新数据，时间范围: ${timeRange}`);
  
  // 这里应该调用API获取最新数据
  // 目前使用模拟数据更新界面
  
  // 更新数据卡片
  updateSummaryCards(timeRange);
  
  // 更新图表
  updateCharts(timeRange);
  
  // 更新客户表格
  updateCustomerTable(timeRange);
}

// 更新数据卡片
function updateSummaryCards(timeRange) {
  // 模拟数据
  const summaryData = {
    month: {
      customerCount: 128,
      customerTrend: '+3.2%',
      creditAmount: '¥1,920,000',
      creditTrend: '+5.7%',
      riskCustomers: 12,
      riskTrend: '+2',
      overdueAmount: '¥85,230',
      overdueTrend: '+12.3%'
    },
    quarter: {
      customerCount: 142,
      customerTrend: '+8.4%',
      creditAmount: '¥2,340,000',
      creditTrend: '+9.8%',
      riskCustomers: 15,
      riskTrend: '+3',
      overdueAmount: '¥104,520',
      overdueTrend: '+15.7%'
    },
    year: {
      customerCount: 189,
      customerTrend: '+21.9%',
      creditAmount: '¥3,750,000',
      creditTrend: '+32.1%',
      riskCustomers: 23,
      riskTrend: '+8',
      overdueAmount: '¥187,350',
      overdueTrend: '+28.5%'
    }
  };
  
  const data = summaryData[timeRange] || summaryData.month;
  
  // 更新客户总数
  document.querySelector('.summary-card:nth-child(1) .card-value').textContent = data.customerCount;
  document.querySelector('.summary-card:nth-child(1) .card-trend').textContent = data.customerTrend + ' 较上期';
  
  // 更新授信额度
  document.querySelector('.summary-card:nth-child(2) .card-value').textContent = data.creditAmount;
  document.querySelector('.summary-card:nth-child(2) .card-trend').textContent = data.creditTrend + ' 较上期';
  
  // 更新风险客户
  document.querySelector('.summary-card:nth-child(3) .card-value').textContent = data.riskCustomers;
  document.querySelector('.summary-card:nth-child(3) .card-trend').textContent = data.riskTrend + ' 较上期';
  
  // 更新逾期金额
  document.querySelector('.summary-card:nth-child(4) .card-value').textContent = data.overdueAmount;
  document.querySelector('.summary-card:nth-child(4) .card-trend').textContent = data.overdueTrend + ' 较上期';
}

// 更新图表
function updateCharts(timeRange) {
  // 实际项目中应该根据timeRange获取数据并更新图表
  console.log(`更新图表，时间范围: ${timeRange}`);
}

// 更新客户表格
function updateCustomerTable(timeRange) {
  // 实际项目中应该根据timeRange获取数据并更新表格
  console.log(`更新客户表格，时间范围: ${timeRange}`);
}

// 排序表格
function sortTable(field) {
  console.log(`排序字段: ${field}`);
  
  // 获取排序图标
  const header = document.querySelector(`.data-table th[data-sort="${field}"]`);
  const icon = header.querySelector('i');
  const isDescending = icon.classList.contains('fa-sort-down');
  
  // 重置所有排序图标
  document.querySelectorAll('.data-table th i').forEach(i => {
    i.className = 'fas fa-sort';
  });
  
  // 设置当前排序图标
  icon.className = isDescending ? 'fas fa-sort-up' : 'fas fa-sort-down';
  
  // 获取表格行
  const tbody = document.querySelector('.data-table tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  // 排序行
  rows.sort((a, b) => {
    let aValue, bValue;
    
    if (field === 'name') {
      aValue = a.cells[0].textContent;
      bValue = b.cells[0].textContent;
      return isDescending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    } else if (field === 'credit' || field === 'used' || field === 'receivable') {
      const colIndex = field === 'credit' ? 1 : (field === 'used' ? 2 : 3);
      aValue = parseFloat(a.cells[colIndex].textContent.replace(/[^0-9.-]+/g, ''));
      bValue = parseFloat(b.cells[colIndex].textContent.replace(/[^0-9.-]+/g, ''));
    } else if (field === 'lastPayment') {
      aValue = new Date(a.cells[4].textContent);
      bValue = new Date(b.cells[4].textContent);
    } else if (field === 'terms') {
      aValue = parseInt(a.cells[5].textContent);
      bValue = parseInt(b.cells[5].textContent);
    } else if (field === 'risk') {
      const ratingMap = { 'A级': 1, 'B级': 2, 'C级': 3, 'D级': 4 };
      aValue = ratingMap[a.cells[6].querySelector('.risk-badge').textContent] || 0;
      bValue = ratingMap[b.cells[6].querySelector('.risk-badge').textContent] || 0;
    }
    
    return isDescending ? bValue - aValue : aValue - bValue;
  });
  
  // 重新添加排序后的行
  rows.forEach(row => tbody.appendChild(row));
}

// 显示信用评级标准
function showCreditRatingCriteria() {
  const modal = document.getElementById('creditRatingModal');
  if (!modal) return;
  
  // 初始化评级内容
  updateRatingContent('A');
  
  // 绑定评级标签点击事件
  const ratingTabs = modal.querySelectorAll('.rating-tab');
  ratingTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const rating = this.getAttribute('data-rating');
      
      // 更新标签状态
      ratingTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // 更新内容
      updateRatingContent(rating);
    });
  });
  
  // 显示模态框
  openModal(modal);
}

// 更新评级内容
function updateRatingContent(rating) {
  const contentElement = document.getElementById('ratingContent');
  if (!contentElement) return;
  
  // 评级内容
  const ratingContents = {
    'A': {
      title: 'A级（优质信用客户）',
      description: '超强的财务实力和优秀的付款历史，几乎没有任何信用风险。',
      criteria: [
        { name: '付款历史', details: ['从不逾期或逾期不超过3天', '过去12个月内始终保持良好的付款记录'] },
        { name: '财务状况', details: ['稳定增长的营业收入', '较高的利润率', '充足的现金流'] },
        { name: '业务规模', details: ['行业领先企业', '市场份额稳定或增长', '业务多元化'] },
        { name: '合作关系', details: ['长期稳定的合作关系（3年以上）', '订单频率高且稳定'] }
      ]
    },
    'B': {
      title: 'B级（良好信用客户）',
      description: '良好的财务实力和付款历史，信用风险较低。',
      criteria: [
        { name: '付款历史', details: ['偶尔逾期（不超过7天）', '过去12个月内逾期次数不超过3次'] },
        { name: '财务状况', details: ['稳定的营业收入', '行业平均利润率', '足够的现金流'] },
        { name: '业务规模', details: ['行业内知名企业', '市场份额稳定', '业务相对集中'] },
        { name: '合作关系', details: ['稳定的合作关系（1-3年）', '订单频率较高'] }
      ]
    },
    'C': {
      title: 'C级（一般信用客户）',
      description: '一般财务实力和不稳定的付款历史，存在一定信用风险。',
      criteria: [
        { name: '付款历史', details: ['经常逾期（7-30天）', '过去12个月内有多次逾期记录'] },
        { name: '财务状况', details: ['营业收入波动', '低于行业平均利润率', '现金流偏紧'] },
        { name: '业务规模', details: ['行业内一般企业', '市场份额不稳定', '业务单一'] },
        { name: '合作关系', details: ['较短的合作关系（不足1年）', '订单频率不稳定'] }
      ]
    },
    'D': {
      title: 'D级（风险信用客户）',
      description: '较弱的财务实力和较差的付款历史，信用风险较高。',
      criteria: [
        { name: '付款历史', details: ['长期逾期（超过30天）', '过去12个月内有多次严重逾期'] },
        { name: '财务状况', details: ['营业收入下降', '持续亏损', '现金流紧张'] },
        { name: '业务规模', details: ['行业内较小企业', '市场份额下降', '业务单一且不稳定'] },
        { name: '合作关系', details: ['新客户或合作关系不稳定', '订单频率低且不稳定'] }
      ]
    }
  };
  
  const content = ratingContents[rating];
  
  // 生成HTML内容
  let html = `
    <div class="rating-header">
      <h3>${content.title}</h3>
      <p class="rating-description">${content.description}</p>
    </div>
    <div class="rating-criteria">
  `;
  
  content.criteria.forEach(criterion => {
    html += `
      <div class="criterion-group">
        <h4 class="criterion-title">${criterion.name}</h4>
        <ul class="criterion-list">
    `;
    
    criterion.details.forEach(detail => {
      html += `<li>${detail}</li>`;
    });
    
    html += `
        </ul>
      </div>
    `;
  });
  
  html += `</div>`;
  
  contentElement.innerHTML = html;
}

// 显示信用评级详情
function showCreditRatingDetail(rating) {
  // 调用评级标准展示函数，但预先选择特定评级
  showCreditRatingCriteria();
  
  // 选中对应的评级标签
  const ratingTabs = document.querySelectorAll('.rating-tab');
  ratingTabs.forEach(tab => {
    tab.classList.remove('active');
    if (tab.getAttribute('data-rating') === rating) {
      tab.classList.add('active');
    }
  });
  
  // 更新内容
  updateRatingContent(rating);
}

// 打开模态框
function openModal(modal) {
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

// 关闭模态框
function closeModal(modal) {
  modal.classList.remove('show');
  document.body.style.overflow = '';
}

// 显示风险预警提示
function showRiskWarnings() {
  // 显示高风险客户订单提示
  showNotification('⚠️ 发现3个高风险客户新订单，请立即处理！', 'warning', 5000);
  
  // 显示仓库拦截货物提示
  setTimeout(() => {
    showNotification('🛑 系统已自动拦截2个风险客户的发货申请，等待审核', 'error', 5000);
  }, 1500);
  
  // 显示风险预警模态框
  setTimeout(() => {
    const riskWarningModal = document.getElementById('riskWarningModal');
    if (riskWarningModal) {
      // 绑定关闭按钮事件
      const closeButtons = riskWarningModal.querySelectorAll('.close-btn, .close-modal-btn');
      closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          closeModal(riskWarningModal);
        });
      });
      
      // 绑定审核按钮事件
      const reviewButtons = riskWarningModal.querySelectorAll('.btn-primary.btn-sm');
      reviewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
          const row = this.closest('tr');
          const customerName = row.querySelector('td:first-child').textContent;
          showNotification(`正在审核 ${customerName} 的订单`, 'info');
        });
      });
      
      // 绑定详情按钮事件
      const detailButtons = riskWarningModal.querySelectorAll('.btn-secondary.btn-sm');
      detailButtons.forEach(btn => {
        btn.addEventListener('click', function() {
          const row = this.closest('tr');
          const customerName = row.querySelector('td:first-child').textContent;
          const orderNumber = row.querySelector('td:nth-child(2)').textContent;
          const riskReason = row.querySelector('td:nth-child(4)').textContent || 
                            row.querySelector('td:nth-child(3)').textContent;
          
          // 储存客户名称和风险原因到本地会话存储中，以便风险监控页面可以获取
          sessionStorage.setItem('selectedCustomer', customerName);
          sessionStorage.setItem('riskReason', riskReason);
          sessionStorage.setItem('orderNumber', orderNumber);
          
          // 跳转到风险监控页面
          showNotification(`正在跳转到风险监控页面查看 ${customerName} 的详细风险信息`, 'info');
          setTimeout(() => {
            window.location.href = 'risk-monitor.html';
          }, 1000);
        });
      });
      
      // 绑定特批按钮事件
      const specialApproveButtons = riskWarningModal.querySelectorAll('.btn-primary.btn-sm:not(:first-child)');
      specialApproveButtons.forEach(btn => {
        btn.addEventListener('click', function() {
          const row = this.closest('tr');
          const customerName = row.querySelector('td:first-child').textContent;
          showNotification(`对 ${customerName} 的货物已特批放行`, 'success');
          row.style.opacity = '0.5';
          this.disabled = true;
          if (this.previousElementSibling) {
            this.previousElementSibling.disabled = true;
          }
        });
      });
      
      // 绑定查看全部风险按钮事件
      const viewAllRisksBtn = document.getElementById('viewAllRisksBtn');
      if (viewAllRisksBtn) {
        viewAllRisksBtn.addEventListener('click', function() {
          showNotification('正在跳转到风险监控页面查看所有风险事项', 'info');
          setTimeout(() => {
            window.location.href = 'risk-monitor.html';
          }, 1000);
        });
      }
      
      // 绑定批量处理按钮事件
      const processAllRisksBtn = document.getElementById('processAllRisksBtn');
      if (processAllRisksBtn) {
        processAllRisksBtn.addEventListener('click', function() {
          showNotification('已将所有风险事项分配至相关部门处理', 'success');
          setTimeout(() => {
            closeModal(riskWarningModal);
          }, 1000);
        });
      }
      
      // 显示模态框
      openModal(riskWarningModal);
    }
  }, 3000);
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