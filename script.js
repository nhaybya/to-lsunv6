// Constants
const PASSWORD = "Nhayy"; // Mật khẩu đã được thay đổi theo yêu cầu

// DOM Elements
const passwordScreen = document.getElementById('password-screen');
const capitalScreen = document.getElementById('capital-screen');
const gameScreen = document.getElementById('game-screen');
const betResultCard = document.getElementById('bet-result-card');
const modal = document.getElementById('modal');
const toast = document.getElementById('toast');

const passwordForm = document.getElementById('password-form');
const passwordInput = document.getElementById('password-input');
const togglePasswordBtn = document.getElementById('toggle-password');

const capitalForm = document.getElementById('capital-form');
const capitalInput = document.getElementById('capital-input');
const capitalError = document.getElementById('capital-error');

const diceForm = document.getElementById('dice-form');
const diceInput = document.getElementById('dice-input');
const helpButton = document.getElementById('help-button');
const currentBalanceEl = document.getElementById('current-balance');
const previousSequenceEl = document.getElementById('previous-sequence');
const sequenceValueEl = document.getElementById('sequence-value');

const resultTypeEl = document.getElementById('result-type');
const resultPercentageEl = document.getElementById('result-percentage');
const resultAmountEl = document.getElementById('result-amount');

const lowBetsStep = document.getElementById('low-bets-step');
const lowMoneyStep = document.getElementById('low-money-step');
const finalResultStep = document.getElementById('final-result-step');

const lowBetsTaiBtn = document.getElementById('low-bets-tai');
const lowBetsXiuBtn = document.getElementById('low-bets-xiu');
const lowMoneyTaiBtn = document.getElementById('low-money-tai');
const lowMoneyXiuBtn = document.getElementById('low-money-xiu');

const finalResultTypeEl = document.getElementById('final-result-type');
const betWinBtn = document.getElementById('bet-win');
const betLoseBtn = document.getElementById('bet-lose');

const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalIcon = document.getElementById('modal-icon');
const modalButtons = document.getElementById('modal-buttons');

const toastTitle = document.getElementById('toast-title');
const toastMessage = document.getElementById('toast-message');
const toastCloseBtn = document.getElementById('toast-close');

// State variables
let attemptCount = 0;
let capital = 0;
let previousSequence = [];
let currentResult = null;

// Utility functions
function formatCurrency(amount) {
  return `${amount}k`;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getRandomBet(capital) {
  const maxBet = Math.floor(capital * 0.5); // 50% of capital
  const minBet = 5; // Minimum bet
  
  if (maxBet < minBet) return null;
  
  return Math.floor(Math.random() * (maxBet - minBet + 1)) + minBet;
}

function showScreen(screenId) {
  // Hide all screens
  passwordScreen.classList.add('hidden');
  capitalScreen.classList.add('hidden');
  gameScreen.classList.add('hidden');
  betResultCard.classList.add('hidden');
  
  // Show the requested screen
  document.getElementById(screenId).classList.remove('hidden');
}

function showModal(title, message, buttons, iconType = 'info') {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  
  // Set icon
  modalIcon.className = 'modal-icon ' + iconType;
  const iconSVG = modalIcon.querySelector('svg');
  
  switch (iconType) {
    case 'success':
      iconSVG.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';
      break;
    case 'error':
      iconSVG.innerHTML = '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>';
      break;
    case 'warning':
      iconSVG.innerHTML = '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>';
      break;
    default: // info
      iconSVG.innerHTML = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>';
  }
  
  // Clear existing buttons
  modalButtons.innerHTML = '';
  
  // Add new buttons
  buttons.forEach(button => {
    const btn = document.createElement('button');
    btn.textContent = button.text;
    btn.className = `button ${button.variant || 'primary'}`;
    btn.addEventListener('click', () => {
      hideModal();
      if (typeof button.action === 'function') {
        button.action();
      }
    });
    modalButtons.appendChild(btn);
  });
  
  // Show modal
  modal.classList.remove('hidden');
}

function hideModal() {
  modal.classList.add('hidden');
}

function showToast(title, message, duration = 3000) {
  toastTitle.textContent = title;
  toastMessage.textContent = message;
  toast.classList.remove('hidden');
  
  // Auto-hide after duration
  setTimeout(() => {
    hideToast();
  }, duration);
}

function hideToast() {
  toast.classList.add('hidden');
}

// Process dice numbers to determine bet suggestion
function processDiceNumbers(numbers) {
  if (numbers.length !== 4) return null;
  
  const [num1, num2, num3, num4] = numbers;
  
  // Calculate result based on algorithm
  const sum = num4 + num1 * num2 - num3;
  
  // Check if even or odd
  const isEven = (sum % 2 === 0);
  let resultType = isEven ? "tài" : "xỉu";
  
  // Additional conditions from the original algorithm
  if (numbers.includes(18)) {
    resultType = "tài";
  }
  
  // Random win percentage between 90-100%
  const percentage = Math.floor(Math.random() * 11) + 90;
  
  // Calculate bet amount
  const betAmount = getRandomBet(capital);
  
  return {
    type: resultType,
    percentage,
    betAmount
  };
}

// Process additional betting parameters
function processResult(lowBetsSide, lowMoneySide) {
  if (!currentResult) return "";
  
  // Determine final result type based on conditions (following original logic)
  const initialType = currentResult.type;
  
  // The logic is: if both lowBetsSide and lowMoneySide are the same, 
  // the result stays the same, otherwise use the original suggestion
  return initialType;
}

// Reset the bet result for next round
function resetBetResult() {
  betResultCard.classList.add('hidden');
  diceInput.value = '';
  lowBetsStep.classList.remove('hidden');
  lowMoneyStep.classList.add('hidden');
  finalResultStep.classList.add('hidden');
}

// Handle betting result
function processBetting(isWin) {
  if (!currentResult) return;
  
  const betAmount = currentResult.betAmount;
  
  if (isWin) {
    // Add to capital if win
    capital += betAmount;
    
    showModal(
      "Thắng cược!",
      `Bạn đã Liếm và cộng thêm ${formatCurrency(betAmount)}. Vốn hiện tại: ${formatCurrency(capital)}.`,
      [{ text: "Tiếp tục", action: resetBetResult }],
      "success"
    );
  } else {
    // Subtract from capital if lose
    capital -= betAmount;
    
    showModal(
      "Thua cược!",
      `Bạn đã Gãy và trừ ${formatCurrency(betAmount)}. Vốn hiện tại: ${formatCurrency(capital)}.`,
      [{ text: "Tiếp tục", action: resetBetResult }],
      "warning"
    );
    
    // Check if out of capital
    if (capital <= 0) {
      capital = 0;
      showModal(
        "Đã hết vốn",
        "Nhayy xin lỗi bạn 😓",
        [{ text: "Buồn quá ☺️", action: resetBetResult }],
        "error"
      );
    }
  }
  
  // Update displayed balance
  updateBalance();
}

// Update the displayed balance
function updateBalance() {
  currentBalanceEl.textContent = formatCurrency(capital);
}

// Event Listeners
// Toggle password visibility
togglePasswordBtn.addEventListener('click', () => {
  const type = passwordInput.type === 'password' ? 'text' : 'password';
  passwordInput.type = type;
  
  // Update the eye icon
  const eyeIcon = togglePasswordBtn.querySelector('svg');
  if (type === 'text') {
    eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
  } else {
    eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
  }
});

// Password form submission
passwordForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const enteredPassword = passwordInput.value;
  
  if (enteredPassword === PASSWORD) {
    showModal(
      "Xác thực thành công",
      "Xin chào bạn! Hôm nay Nhayy sẽ giúp bạn về bờ nhé 🤝!",
      [
        {
          text: "Tôi Kì Vọng Vào Bạn 🍀",
          action: () => showScreen('capital-screen'),
        },
      ],
      "success"
    );
  } else {
    attemptCount++;
    if (attemptCount >= 2) {
      showModal(
        "Xác thực thất bại",
        "Bạn đã nhập sai mật khẩu quá 2 lần! Vui lòng liên hệ để được hỗ trợ.",
        [
          {
            text: "Liên hệ",
            action: () => window.open("https://facebook.com/Nhayydzvcl", "_blank"),
            variant: "primary"
          },
          { 
            text: "Thử lại", 
            action: () => {
              passwordInput.value = '';
              passwordInput.focus();
            },
            variant: "secondary"
          },
        ],
        "error"
      );
    } else {
      showModal(
        "Xác thực thất bại",
        "KEY không chính xác!",
        [{ 
          text: "Nhập lại", 
          action: () => {
            passwordInput.value = '';
            passwordInput.focus();
          }
        }],
        "error"
      );
    }
  }
});

// Capital form submission
capitalForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Parse input, remove non-numeric characters
  const capitalValue = parseFloat(capitalInput.value.replace(/[^0-9]/g, ""));
  
  if (!isNaN(capitalValue) && capitalValue > 0) {
    capital = capitalValue;
    showScreen('game-screen');
    updateBalance();
    
    showToast(
      "Số tiền vốn đã được cập nhật",
      `Vốn hiện tại: ${formatCurrency(capital)}`
    );
    
    capitalError.classList.add('hidden');
  } else {
    capitalError.textContent = "Vui lòng nhập số tiền hợp lệ (vd: 500k)";
    capitalError.classList.remove('hidden');
  }
});

// Help button
helpButton.addEventListener('click', () => {
  showModal(
    "Hướng dẫn nhập cầu",
    "Bạn có thể nhập đầy đủ 4 số (vd: 11-9-7-12) hoặc chỉ nhập số tiếp theo nếu đã có cầu trước đó (vd: 14). Hệ thống sẽ tự động giữ 3 số gần nhất và thêm số mới.",
    [{ text: "Đã hiểu", action: () => {} }],
    "info"
  );
});

// Dice form submission
diceForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  let numbers = [];
  
  // Check if input contains dashes (full input format)
  if (diceInput.value.includes("-")) {
    numbers = diceInput.value.split("-").map((num) => parseInt(num.trim(), 10));
    
    // Validate input format
    if (
      numbers.length !== 4 ||
      numbers.some(isNaN) ||
      numbers.some((n) => n < 1 || n > 18)
    ) {
      showModal(
        "Lỗi",
        "Vui lòng nhập cầu gần nhất 4 số từ 1 đến 18, cách nhau bằng dấu gạch ngang (vd: 11-9-7-12)",
        [{ text: "Thử lại", action: () => {} }],
        "error"
      );
      return;
    }
    
    // Save the sequence for future reference
    previousSequence = [...numbers];
  } else {
    // Handle the case of single number input
    const newNumber = parseInt(diceInput.value.trim(), 10);
    
    if (isNaN(newNumber) || newNumber < 1 || newNumber > 18) {
      showModal(
        "Lỗi",
        "Vui lòng nhập một số hợp lệ từ 1 đến 18",
        [{ text: "Thử lại", action: () => {} }],
        "error"
      );
      return;
    }
    
    // If we already have a previous sequence, use it
    if (previousSequence.length === 4) {
      // Shift the array and add the new number
      previousSequence = [...previousSequence.slice(1), newNumber];
      numbers = previousSequence;
    } else {
      // If no previous sequence, show an error
      showModal(
        "Lỗi",
        "Vui lòng nhập đầy đủ 4 số đầu tiên (vd: 11-9-7-12)",
        [{ text: "Thử lại", action: () => {} }],
        "error"
      );
      return;
    }
  }
  
  // Update previous sequence display
  sequenceValueEl.textContent = previousSequence.join('-');
  previousSequenceEl.classList.remove('hidden');
  
  // Process the numbers to determine bet
  const result = processDiceNumbers(numbers);
  
  if (result) {
    if (result.betAmount === null) {
      showModal(
        "Không đủ vốn",
        `Vốn của bạn là ${formatCurrency(capital)}, không thể đặt cược.`,
        [{ text: "OK", action: () => {} }],
        "warning"
      );
      return;
    }
    
    // Save current result
    currentResult = result;
    
    // Update result display
    resultTypeEl.textContent = capitalizeFirstLetter(result.type);
    resultPercentageEl.textContent = result.percentage + '%';
    resultAmountEl.textContent = formatCurrency(result.betAmount);
    
    // Show bet result card and first step
    betResultCard.classList.remove('hidden');
    lowBetsStep.classList.remove('hidden');
    lowMoneyStep.classList.add('hidden');
    finalResultStep.classList.add('hidden');
  }
});

// Low bets buttons
lowBetsTaiBtn.addEventListener('click', () => {
  currentResult.lowBetsSide = 'tài';
  lowBetsStep.classList.add('hidden');
  lowMoneyStep.classList.remove('hidden');
});

lowBetsXiuBtn.addEventListener('click', () => {
  currentResult.lowBetsSide = 'xỉu';
  lowBetsStep.classList.add('hidden');
  lowMoneyStep.classList.remove('hidden');
});

// Low money buttons
lowMoneyTaiBtn.addEventListener('click', () => {
  currentResult.lowMoneySide = 'tài';
  
  // Process final result
  const finalType = processResult(currentResult.lowBetsSide, 'tài');
  currentResult.finalType = finalType;
  
  // Update display
  finalResultTypeEl.textContent = capitalizeFirstLetter(finalType);
  
  // Show final step
  lowMoneyStep.classList.add('hidden');
  finalResultStep.classList.remove('hidden');
});

lowMoneyXiuBtn.addEventListener('click', () => {
  currentResult.lowMoneySide = 'xỉu';
  
  // Process final result
  const finalType = processResult(currentResult.lowBetsSide, 'xỉu');
  currentResult.finalType = finalType;
  
  // Update display
  finalResultTypeEl.textContent = capitalizeFirstLetter(finalType);
  
  // Show final step
  lowMoneyStep.classList.add('hidden');
  finalResultStep.classList.remove('hidden');
});

// Betting buttons
betWinBtn.addEventListener('click', () => {
  processBetting(true);
});

betLoseBtn.addEventListener('click', () => {
  processBetting(false);
});

// Toast close button
toastCloseBtn.addEventListener('click', hideToast);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Start with password screen
  showScreen('password-screen');
});