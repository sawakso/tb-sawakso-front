<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-logo">
        <span class="logo-bracket">{</span>
        <span class="logo-text">{{ title }}</span>
        <span class="logo-bracket">}</span>
      </div>
      <p class="footer-tagline">TB • CHAT • FUN</p>
      <div class="social-links">
        <a href="https://github.com/sawakso" target="_blank" rel="noopener noreferrer"><i class="fab fa-github"></i></a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><i class="fab fa-twitter"></i></a>
        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><i class="fab fa-linkedin"></i></a>
        <a href="https://codepen.io" target="_blank" rel="noopener noreferrer"><i class="fab fa-codepen"></i></a>
      </div>
      <p class="copyright">© 2026 TB_sawakso. All code samples are MIT licensed.</p>
    </div>
  </footer>
</template>

<script setup>
defineProps({
  title: String
})
</script>

<style scoped>
.footer {
  border-top: 1px solid var(--border-color);
  padding: 50px 0;
  text-align: center;
  backdrop-filter: blur(10px);
}
.footer-logo {
  font-family: 'Source Code Pro', monospace;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 15px;
  display: inline-flex;
  align-items: center;
}
.footer-tagline {
  color: var(--text-secondary);
  margin-bottom: 25px;
  font-size: 1.1rem;
}
.social-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}
.social-links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: var(--surface-color);
  color: var(--text-color);
  font-size: 1.2rem;
  transition: var(--transition);
  border: 1px solid var(--border-color);
  text-decoration: none;
}
.social-links a:hover {
  color: var(--primary-color);
  transform: translateY(-3px);
  border-color: var(--primary-color);
}
.copyright {
  color: var(--text-secondary);
  font-size: 0.9rem;
}
.logo-bracket { color: var(--primary-color); }
.logo-text { margin: 0 8px; color: var(--text-color); }
</style>