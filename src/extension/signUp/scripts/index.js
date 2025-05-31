document.addEventListener('DOMContentLoaded', function () {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const signInButton = document.getElementById('signInButton');
  const togglePassword = document.getElementById('togglePassword');
  const toggleIcon = document.getElementById('toggleIcon');

  function toggleSignInButton() {
    if (emailInput.value && passwordInput.value) {
      signInButton.disabled = false;
    } else {
      signInButton.disabled = true;
    }
  }

  // Kiểm tra sự tồn tại của các phần tử trước khi thêm sự kiện
  if (emailInput && passwordInput && signInButton && togglePassword && toggleIcon) {
    // Toggle hiển thị mật khẩu
    togglePassword.addEventListener('click', function () {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.src = 'icons/hide-password.png';
        toggleIcon.alt = 'Hide Password Icon';
      } else {
        passwordInput.type = 'password';
        toggleIcon.src = 'icons/show-password.png';
        toggleIcon.alt = 'Show Password Icon';
      }
    });

    emailInput.addEventListener('input', toggleSignInButton);
    passwordInput.addEventListener('input', toggleSignInButton);

    // Thêm sự kiện cho nút Sign In
    signInButton.addEventListener('click', function () {
      // Sau khi nhấn nút Sign In, chuyển hướng đến home-vault.html
      chrome.tabs.create({ url: chrome.runtime.getURL('vault.html') });
      console.log('Sign In button clicked');
    });
  } else {
    console.error('One or more elements are missing');
  }
});
