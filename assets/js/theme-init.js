(() => {
  try {
    const savedTheme = localStorage.getItem('polar-bear-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      document.documentElement.dataset.theme = savedTheme;
    }
  } catch (_) {
    // The CSS preference remains the fallback when storage is unavailable.
  }
})();
