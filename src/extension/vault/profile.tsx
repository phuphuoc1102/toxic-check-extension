import { API_ENDPOINT_AI } from '@/constants/env';
import { logoutApi } from '@/lib/services/auth.service';
import { logout } from '@/store/auth-slice';
import { RootState } from '@/store/store';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/index.css';
import LanguageDropdown from './components/LanguageDropdown';
import MenuItem from './components/MenuItem';
import Switch from './components/Switch';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 giờ

// Helper functions cho cache
const getCacheKey = (texts: string[], language: string) => {
  return `toxic_cache_${language}_${JSON.stringify(texts.sort()).slice(0, 100)}`;
};

const getCachedResult = async (cacheKey: string) => {
  return new Promise((resolve) => {
    chrome.storage.local.get([cacheKey], (result) => {
      const cached = result[cacheKey];
      if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
        resolve(cached.data);
      } else {
        resolve(null);
      }
    });
  });
};
const getImageHashCacheKey = (imageHash: string) => {
  return `image_cache_hash_${imageHash}`;
};

const getCachedImageResult = async (imageHash: string) => {
  return new Promise((resolve) => {
    const cacheKey = getImageHashCacheKey(imageHash);
    chrome.storage.local.get([cacheKey], (result) => {
      const cached = result[cacheKey];
      if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
        resolve(cached.data);
      } else {
        resolve(null);
      }
    });
  });
};

const setCachedImageResult = (imageHash: string, data: any) => {
  const cacheKey = getImageHashCacheKey(imageHash);
  chrome.storage.local.set({
    [cacheKey]: {
      data: data,
      timestamp: Date.now(),
    },
  });
};

const setCachedResult = (cacheKey: string, data: any) => {
  chrome.storage.local.set({
    [cacheKey]: {
      data: data,
      timestamp: Date.now(),
    },
  });
};

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((s: RootState) => s.auth.isLoggedIn);
  const user = useSelector((s: RootState) => s.auth.user);

  /** local state */
  const [isTextFilterOn, setTextFilterOn] = useState(false);
  const [isImageFilterOn, setImageFilterOn] = useState(false);
  const [isSecurityOn, setIsSecurityOn] = useState(user?.is_security_on || false);
  const [isDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);
  const [language, setLanguage] = useState<'vi' | 'en'>('vi');
  const [toxicFilters, setToxicFilters] = useState({
    toxic: true,
    severe_toxic: true,
    obscene: true,
    threat: true,
    insult: true,
    identity_hate: true,
  });

  /** ――― THÊM: Function để tự động áp dụng text filter ――― */
  const applyTextFilter = async (tabId: number, language: string, isLoggedIn: boolean) => {
    try {
      const texts: string[] = await new Promise((resolve) => {
        chrome.scripting.executeScript(
          {
            target: { tabId },
            func: () =>
              Array.from(document.querySelectorAll('span'))
                .map((el) => (el as HTMLElement).innerText)
                .filter((t) => t && t.trim().length > 3),
          },
          (rs) => resolve(rs?.[0]?.result ?? []),
        );
      });

      if (!texts.length) return;

      const cacheKey = getCacheKey(texts, language);
      let results: any = await getCachedResult(cacheKey);

      if (!results) {
        const endpoint =
          language === 'vi' ? `${API_ENDPOINT_AI}/predict_vi` : `${API_ENDPOINT_AI}/predict_en`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts }),
        });
        if (!res.ok) return;

        const data = await res.json();
        results = data.results;
        setCachedResult(cacheKey, results);
      }

      if (!results) return;

      const toxicTexts = results
        .filter((r: any) => r.isToxic && r.probability > 0.85)
        .map((r: any) => r.text);

      chrome.scripting.executeScript({
        target: { tabId },
        func: (tox: string[], userLoggedIn: boolean) => {
          const PASSWORD = '1234';

          function injectPasswordPopup(spanElement: HTMLElement, text: string) {
            if (document.getElementById('toxic-password-popup')) return;

            const popup = document.createElement('div');
            popup.id = 'toxic-password-popup';

            if (!userLoggedIn) {
              popup.innerHTML = `
                <div style="
                  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                  background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center;
                  z-index: 9999; backdrop-filter: blur(5px);
                ">
                  <div style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 32px; border-radius: 16px; text-align: center;
                    width: 380px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.2);
                    animation: slideIn 0.3s ease-out;
                    position: relative;
                  ">
                    <button id="toxic-close-btn" style="
                      position: absolute; top: 12px; right: 16px;
                      background: none; border: none; color: white;
                      font-size: 24px; cursor: pointer; line-height: 1;
                      width: 32px; height: 32px; display: flex;
                      align-items: center; justify-content: center;
                      border-radius: 50%; transition: background 0.3s;
                    ">×</button>
                    <div style="
                      background: rgba(255,255,255,0.2); 
                      border-radius: 50%; 
                      width: 60px; height: 60px; 
                      margin: 0 auto 20px auto;
                      display: flex; align-items: center; justify-content: center;
                      font-size: 24px;
                    ">🔒</div>
                    <h3 style="
                      margin-bottom: 16px; font-size: 1.4rem; color: white; 
                      font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    ">Yêu cầu đăng nhập</h3>
                    <p style="
                      color: rgba(255,255,255,0.9); margin-bottom: 20px; 
                      font-size: 14px; line-height: 1.5;
                    ">Bạn cần đăng nhập để xem nội dung này</p>
                  </div>
                </div>
                <style>
                  @keyframes slideIn {
                    from { transform: translateY(-50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                  }
                </style>
              `;
            } else {
              popup.innerHTML = `
                <div style="
                  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                  background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center;
                  z-index: 9999; backdrop-filter: blur(5px);
                ">
                  <div style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 32px; border-radius: 16px; text-align: center;
                    width: 380px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.2);
                    animation: slideIn 0.3s ease-out;
                    position: relative;
                  ">
                    <button id="toxic-close-btn" style="
                      position: absolute; top: 12px; right: 16px;
                      background: none; border: none; color: white;
                      font-size: 24px; cursor: pointer; line-height: 1;
                      width: 32px; height: 32px; display: flex;
                      align-items: center; justify-content: center;
                      border-radius: 50%; transition: background 0.3s;
                    ">×</button>
                    <div style="
                      background: rgba(255,255,255,0.2); 
                      border-radius: 50%; 
                      width: 60px; height: 60px; 
                      margin: 0 auto 20px auto;
                      display: flex; align-items: center; justify-content: center;
                      font-size: 24px;
                    ">🔒</div>
                    <h3 style="
                      margin-bottom: 16px; font-size: 1.4rem; color: white; 
                      font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    ">Nội dung được bảo vệ</h3>
                    <p style="
                      color: rgba(255,255,255,0.9); margin-bottom: 20px; 
                      font-size: 14px; line-height: 1.5;
                    ">Nhập mật khẩu để xem nội dung độc hại này</p>
                    <input type="password" id="toxic-password-input" placeholder="Nhập mật khẩu..." style="
                      margin: 0 0 20px 0; padding: 12px 16px; width: 100%; 
                      border: none; border-radius: 8px; font-size: 16px;
                      background: rgba(255,255,255,0.9); color: #333;
                      box-sizing: border-box; outline: none;
                      box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
                    " />
                    <div style="display: flex; gap: 12px; justify-content: center;">
                      <button id="toxic-password-cancel" style="
                        padding: 12px 20px; background: rgba(255,255,255,0.2); 
                        color: white; border: none; border-radius: 8px; cursor: pointer;
                        font-size: 14px; font-weight: 500; transition: all 0.3s;
                        border: 1px solid rgba(255,255,255,0.3);
                      ">Hủy</button>
                      <button id="toxic-password-submit" style="
                        padding: 12px 20px; background: #4cd964; color: white; 
                        border: none; border-radius: 8px; cursor: pointer;
                        font-size: 14px; font-weight: 500; transition: all 0.3s;
                        box-shadow: 0 4px 12px rgba(76, 217, 100, 0.3);
                      ">Xác nhận</button>
                    </div>
                  </div>
                </div>
                <style>
                  @keyframes slideIn {
                    from { transform: translateY(-50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                  }
                  @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                  }
                </style>
              `;
            }
            document.body.appendChild(popup);

            document.getElementById('toxic-close-btn')?.addEventListener('click', () => {
              document.getElementById('toxic-password-popup')?.remove();
            });

            if (userLoggedIn) {
              setTimeout(() => {
                const input = document.getElementById('toxic-password-input') as HTMLInputElement;
                if (input) input.focus();
              }, 100);

              document.getElementById('toxic-password-submit')?.addEventListener('click', () => {
                const val = (document.getElementById('toxic-password-input') as HTMLInputElement)
                  .value;
                if (val === PASSWORD) {
                  document.getElementById('toxic-password-popup')?.remove();
                  spanElement.style.filter = '';
                  spanElement.removeAttribute('data-unlock-text');
                } else {
                  const input = document.getElementById('toxic-password-input');
                  if (input) {
                    input.style.animation = 'shake 0.5s';
                    input.style.borderColor = '#ff4757';
                    setTimeout(() => {
                      input.style.animation = '';
                      input.style.borderColor = '';
                    }, 500);
                  }
                }
              });

              document.getElementById('toxic-password-cancel')?.addEventListener('click', () => {
                document.getElementById('toxic-password-popup')?.remove();
              });

              document.getElementById('toxic-password-input')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                  document.getElementById('toxic-password-submit')?.click();
                }
              });
            }

            popup.addEventListener('click', (e) => {
              if (e.target === popup) {
                popup.remove();
              }
            });

            const escapeHandler = (e: KeyboardEvent) => {
              if (e.key === 'Escape') {
                popup.remove();
                document.removeEventListener('keydown', escapeHandler);
              }
            };
            document.addEventListener('keydown', escapeHandler);
          }

          const els = document.querySelectorAll('span');
          els.forEach((el) => {
            const text = (el as HTMLElement).innerText;
            if (tox.includes(text)) {
              (el as HTMLElement).style.filter = 'blur(5px)';
              (el as HTMLElement).style.pointerEvents = 'auto';
              (el as HTMLElement).style.cursor = 'pointer';
              el.setAttribute('data-unlock-text', 'true');

              el.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (el.getAttribute('data-unlock-text')) {
                  injectPasswordPopup(el as HTMLElement, text);
                }
              });
            }
          });
        },
        args: [toxicTexts, isLoggedIn],
      });
    } catch (error) {
      console.error('❌ Error in auto text filter:', error);
    }
  };

  /** ――― THÊM: Function để tự động áp dụng image filter ――― */
  const applyImageFilter = async (tabId: number, isLoggedIn: boolean) => {
    try {
      const imageData: Array<{
        url: string;
        hash: string;
        isBase64: boolean;
        size: { width: number; height: number };
      }> = await new Promise((resolve) => {
        chrome.scripting.executeScript(
          {
            target: { tabId },
            func: () => {
              function simpleHash(str: string): string {
                let hash = 0;
                for (let i = 0; i < Math.min(str.length, 1000); i++) {
                  const char = str.charCodeAt(i);
                  hash = (hash << 5) - hash + char;
                  hash = hash & hash;
                }
                return hash.toString();
              }

              const allImages = Array.from(document.querySelectorAll('img'));
              const imageData = allImages.map((el) => {
                const imgEl = el as HTMLImageElement;
                const src = imgEl.src;
                const isBase64 = src.startsWith('data:image/');
                const width = imgEl.naturalWidth || imgEl.width;
                const height = imgEl.naturalHeight || imgEl.height;

                return {
                  url: src,
                  hash: simpleHash(src),
                  isBase64: isBase64,
                  size: { width, height },
                };
              });

              return imageData.filter((img) => {
                return (
                  img.url &&
                  img.url !== 'about:blank' &&
                  !img.url.includes('chrome-extension://') &&
                  img.size.width > 10 &&
                  img.size.height > 10
                );
              });
            },
          },
          (rs) => resolve(rs?.[0]?.result ?? []),
        );
      });

      if (!imageData.length) return;

      const cachedResults = new Map<string, any>();
      const uncachedImages: Array<{ url: string; hash: string; index: number }> = [];

      for (let i = 0; i < imageData.length; i++) {
        const img = imageData[i];
        const cachedResult = await getCachedImageResult(img.hash);

        if (cachedResult !== null) {
          cachedResults.set(img.hash, cachedResult);
        } else {
          uncachedImages.push({ ...img, index: i });
        }
      }

      if (uncachedImages.length > 0) {
        const BATCH_SIZE = 5;
        const batches = [];
        for (let i = 0; i < uncachedImages.length; i += BATCH_SIZE) {
          batches.push(uncachedImages.slice(i, i + BATCH_SIZE));
        }

        for (const batch of batches) {
          try {
            const res = await fetch(`${API_ENDPOINT_AI}/predict_violence_image_batch`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                image_urls: batch.map((img) => img.url),
              }),
            });

            if (res.ok) {
              const data = await res.json();
              const batchResults = data.results || [];

              batchResults.forEach((result: any, index: number) => {
                if (batch[index]) {
                  const imgHash = batch[index].hash;
                  setCachedImageResult(imgHash, result);
                  cachedResults.set(imgHash, result);
                }
              });
            }
          } catch (error) {
            console.error('❌ Error processing batch:', error);
            batch.forEach((img) => {
              setCachedImageResult(img.hash, { error: true });
              cachedResults.set(img.hash, { error: true });
            });
          }
        }
      }

      const violentHashes = new Set<string>();
      imageData.forEach((img) => {
        const result = cachedResults.get(img.hash);
        if (result && !result.error && result.prediction === 'violence') {
          violentHashes.add(img.hash);
        }
      });

      if (violentHashes.size === 0) return;

      chrome.scripting.executeScript({
        target: { tabId },
        func: (violentHashesArray: string[], userLoggedIn: boolean) => {
          const violentHashSet = new Set(violentHashesArray);
          const PASSWORD = '1234';

          function simpleHash(str: string): string {
            let hash = 0;
            for (let i = 0; i < Math.min(str.length, 1000); i++) {
              const char = str.charCodeAt(i);
              hash = (hash << 5) - hash + char;
              hash = hash & hash;
            }
            return hash.toString();
          }

          function createLockOverlay(imgElement: HTMLImageElement): HTMLElement {
            const overlay = document.createElement('div');
            overlay.className = 'violence-lock-overlay';
            overlay.style.cssText = `
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: 100% !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              background: rgba(0, 0, 0, 0.3) !important;
              z-index: 999 !important;
              border-radius: inherit !important;
              pointer-events: none !important;
              transition: all 0.3s ease !important;
            `;

            const lockIcon = document.createElement('div');
            lockIcon.style.cssText = `
              background: rgba(255, 255, 255, 0.9) !important;
              color: #333 !important;
              border-radius: 50% !important;
              width: 60px !important;
              height: 60px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              font-size: 24px !important;
              font-weight: bold !important;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
              border: 3px solid #ff6b6b !important;
              animation: pulse 2s infinite !important;
            `;
            lockIcon.innerHTML = '🔒';

            overlay.appendChild(lockIcon);
            return overlay;
          }

          function injectPasswordPopup(imgElement: HTMLImageElement) {
            if (document.getElementById('violence-password-popup')) return;

            const popup = document.createElement('div');
            popup.id = 'violence-password-popup';

            if (!userLoggedIn) {
              popup.innerHTML = `
                <div style="
                  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                  background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center;
                  z-index: 99999; backdrop-filter: blur(5px);
                ">
                  <div style="
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                    padding: 32px; border-radius: 16px; text-align: center;
                    width: 380px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.2);
                    animation: slideIn 0.3s ease-out;
                    position: relative;
                  ">
                    <button id="violence-close-btn" style="
                      position: absolute; top: 12px; right: 16px;
                      background: none; border: none; color: white;
                      font-size: 24px; cursor: pointer; line-height: 1;
                      width: 32px; height: 32px; display: flex;
                      align-items: center; justify-content: center;
                      border-radius: 50%; transition: background 0.3s;
                    ">×</button>
                    <div style="
                      background: rgba(255,255,255,0.2); 
                      border-radius: 50%; 
                      width: 60px; height: 60px; 
                      margin: 0 auto 20px auto;
                      display: flex; align-items: center; justify-content: center;
                      font-size: 24px;
                    ">🔒</div>
                    <h3 style="
                      margin-bottom: 16px; font-size: 1.4rem; color: white; 
                      font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    ">Yêu cầu đăng nhập</h3>
                    <p style="
                      color: rgba(255,255,255,0.9); margin-bottom: 20px; 
                      font-size: 14px; line-height: 1.5;
                    ">Bạn cần đăng nhập để xem ảnh này</p>
                  </div>
                </div>
                <style>
                  @keyframes slideIn {
                    from { transform: translateY(-50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                  }
                  @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                  }
                </style>
              `;
            } else {
              popup.innerHTML = `
                <div style="
                  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                  background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center;
                  z-index: 99999; backdrop-filter: blur(5px);
                ">
                  <div style="
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                    padding: 32px; border-radius: 16px; text-align: center;
                    width: 380px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.2);
                    animation: slideIn 0.3s ease-out;
                    position: relative;
                  ">
                    <button id="violence-close-btn" style="
                      position: absolute; top: 12px; right: 16px;
                      background: none; border: none; color: white;
                      font-size: 24px; cursor: pointer; line-height: 1;
                      width: 32px; height: 32px; display: flex;
                      align-items: center; justify-content: center;
                      border-radius: 50%; transition: background 0.3s;
                    ">×</button>
                    <div style="
                      background: rgba(255,255,255,0.2); 
                      border-radius: 50%; 
                      width: 60px; height: 60px; 
                      margin: 0 auto 20px auto;
                      display: flex; align-items: center; justify-content: center;
                      font-size: 24px;
                    ">🔒</div>
                    <h3 style="
                      margin-bottom: 16px; font-size: 1.4rem; color: white; 
                      font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    ">Ảnh bạo lực được chặn</h3>
                    <p style="
                      color: rgba(255,255,255,0.9); margin-bottom: 20px; 
                      font-size: 14px; line-height: 1.5;
                    ">Nhập mật khẩu để xem ảnh này</p>
                    <input type="password" id="violence-password-input" placeholder="Nhập mật khẩu..." style="
                      margin: 0 0 20px 0; padding: 12px 16px; width: 100%; 
                      border: none; border-radius: 8px; font-size: 16px;
                      background: rgba(255,255,255,0.9); color: #333;
                      box-sizing: border-box; outline: none;
                      box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
                    " />
                    <div style="display: flex; gap: 12px; justify-content: center;">
                      <button id="violence-password-cancel" style="
                        padding: 12px 20px; background: rgba(255,255,255,0.2); 
                        color: white; border: none; border-radius: 8px; cursor: pointer;
                        font-size: 14px; font-weight: 500; transition: all 0.3s;
                        border: 1px solid rgba(255,255,255,0.3);
                      ">Hủy</button>
                      <button id="violence-password-submit" style="
                        padding: 12px 20px; background: #4cd964; color: white; 
                        border: none; border-radius: 8px; cursor: pointer;
                        font-size: 14px; font-weight: 500; transition: all 0.3s;
                        box-shadow: 0 4px 12px rgba(76, 217, 100, 0.3);
                      ">Xác nhận</button>
                    </div>
                  </div>
                </div>
                <style>
                  @keyframes slideIn {
                    from { transform: translateY(-50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                  }
                  @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                  }
                  @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                  }
                </style>
              `;
            }

            document.body.appendChild(popup);

            document.getElementById('violence-close-btn')?.addEventListener('click', () => {
              document.getElementById('violence-password-popup')?.remove();
            });

            if (userLoggedIn) {
              setTimeout(() => {
                const input = document.getElementById(
                  'violence-password-input',
                ) as HTMLInputElement;
                if (input) input.focus();
              }, 100);

              document.getElementById('violence-password-submit')?.addEventListener('click', () => {
                const val = (document.getElementById('violence-password-input') as HTMLInputElement)
                  .value;
                if (val === PASSWORD) {
                  document.getElementById('violence-password-popup')?.remove();
                  imgElement.style.filter = '';
                  imgElement.style.position = '';
                  imgElement.removeAttribute('data-unlock-video');
                  const lockOverlay =
                    imgElement.parentElement?.querySelector('.violence-lock-overlay');
                  if (lockOverlay) lockOverlay.remove();
                } else {
                  const input = document.getElementById('violence-password-input');
                  if (input) {
                    input.style.animation = 'shake 0.5s';
                    setTimeout(() => (input.style.animation = ''), 500);
                  }
                }
              });

              document.getElementById('violence-password-cancel')?.addEventListener('click', () => {
                document.getElementById('violence-password-popup')?.remove();
              });

              document
                .getElementById('violence-password-input')
                ?.addEventListener('keypress', (e) => {
                  if (e.key === 'Enter') {
                    document.getElementById('violence-password-submit')?.click();
                  }
                });
            }

            popup.addEventListener('click', (e) => {
              if (e.target === popup) {
                popup.remove();
              }
            });

            const escapeHandler = (e: KeyboardEvent) => {
              if (e.key === 'Escape') {
                popup.remove();
                document.removeEventListener('keydown', escapeHandler);
              }
            };
            document.addEventListener('keydown', escapeHandler);
          }

          const imgs = document.querySelectorAll('img');
          imgs.forEach((el) => {
            const src = (el as HTMLImageElement).src;
            const hash = simpleHash(src);

            if (violentHashSet.has(hash)) {
              if (el.getAttribute('data-violence-processed')) return;

              const imgElement = el as HTMLImageElement;
              imgElement.style.filter = 'blur(15px)';
              imgElement.style.cursor = 'pointer';
              imgElement.setAttribute('data-unlock-video', 'true');
              imgElement.setAttribute('data-violence-processed', 'true');

              const parent = imgElement.parentElement;
              if (parent) {
                const parentStyle = getComputedStyle(parent);
                if (parentStyle.position === 'static') {
                  parent.style.position = 'relative';
                }
              }

              const lockOverlay = createLockOverlay(imgElement);

              if (parent) {
                parent.appendChild(lockOverlay);
              } else {
                imgElement.parentNode?.insertBefore(lockOverlay, imgElement.nextSibling);
              }

              imgElement.addEventListener(
                'click',
                (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (imgElement.getAttribute('data-unlock-video')) {
                    injectPasswordPopup(imgElement);
                  }
                },
                true,
              );
            }
          });
        },
        args: [Array.from(violentHashes), isLoggedIn],
      });
    } catch (error) {
      console.error('❌ Error in auto image filter:', error);
    }
  };

  /** sync chrome.storage -> local state */
  useEffect(() => {
    chrome.storage.local.get(
      ['isTextFilterOn', 'isImageFilterOn', 'toxicFilters', 'language'],
      (d) => {
        setTextFilterOn(d.isTextFilterOn || false);
        setImageFilterOn(d.isImageFilterOn || false);
        setToxicFilters(d.toxicFilters || toxicFilters);
        setLanguage(d.language || 'vi');
      },
    );
  }, []);

  /** ――― THÊM: Auto-apply filters khi mount component ――― */
  useEffect(() => {
    // Lắng nghe khi tab được reload hoặc navigate
    const handleTabUpdated = (tabId: number, changeInfo: any, tab: any) => {
      if (
        changeInfo.status === 'complete' &&
        tab.url &&
        !tab.url.startsWith('chrome-extension://') &&
        !tab.url.startsWith('chrome://')
      ) {
        // Delay một chút để trang load xong
        setTimeout(() => {
          chrome.storage.local.get(
            ['isTextFilterOn', 'isImageFilterOn', 'language'],
            async (result) => {
              // Auto-apply text filter nếu đang bật
              if (result.isTextFilterOn) {
                console.log('🔄 Auto-applying text filter after page reload');
                await applyTextFilter(tabId, result.language || 'vi', isLoggedIn);
              }

              // Auto-apply image filter nếu đang bật
              if (result.isImageFilterOn) {
                console.log('🔄 Auto-applying image filter after page reload');
                await applyImageFilter(tabId, isLoggedIn);
              }
            },
          );
        }, 1500); // Delay 1.5s để đảm bảo trang load xong
      }
    };

    // Đăng ký listener
    if (chrome.tabs && chrome.tabs.onUpdated) {
      chrome.tabs.onUpdated.addListener(handleTabUpdated);
    }

    // Cleanup function
    return () => {
      if (chrome.tabs && chrome.tabs.onUpdated) {
        chrome.tabs.onUpdated.removeListener(handleTabUpdated);
      }
    };
  }, [isLoggedIn]); // Re-run khi login status thay đổi

  // ...existing code... (giữ nguyên tất cả các function khác)

  /** sync chrome.storage -> local state */
  // useEffect(() => {
  //   chrome.storage.local.get(
  //     ['isTextFilterOn', 'isImageFilterOn', 'toxicFilters', 'language'],
  //     (d) => {
  //       setTextFilterOn(d.isTextFilterOn || false);
  //       setImageFilterOn(d.isImageFilterOn || false);
  //       setToxicFilters(d.toxicFilters || toxicFilters);
  //       setLanguage(d.language || 'vi');
  //     },
  //   );
  // }, []);

  const handleLogout = async () => {
    await logoutApi();
    dispatch(logout());
  };
  /** getter tiện dụng */

  /* ---------------- toggle text filter ---------------- */
  const handleTextFilterToggle = async (checked: boolean) => {
    setTextFilterOn(checked);
    chrome.storage.local.set({ isTextFilterOn: checked });

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (
        !tab?.id ||
        !tab.url ||
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('chrome://')
      )
        return;

      if (checked) {
        /** ――― 1. trích xuất text trên trang ――― */
        const texts: string[] = await new Promise((resolve) => {
          chrome.scripting.executeScript(
            {
              target: { tabId: tab.id },
              func: () =>
                Array.from(document.querySelectorAll('span'))
                  .map((el) => (el as HTMLElement).innerText)
                  .filter((t) => t && t.trim().length > 3),
            },
            (rs) => resolve(rs?.[0]?.result ?? []),
          );
        });
        console.log('extracted texts:', texts);
        if (!texts.length) return;

        /** ――― 2. kiểm tra cache trước ――― */
        const cacheKey = getCacheKey(texts, language);
        let results: any = await getCachedResult(cacheKey);

        if (!results) {
          /** ――― 3. gọi API dự đoán dựa trên ngôn ngữ được chọn ――― */
          const endpoint =
            language === 'vi' ? `${API_ENDPOINT_AI}/predict_vi` : `${API_ENDPOINT_AI}/predict_en`;
          console.log('Calling endpoint:', endpoint);
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texts }),
          });
          if (!res.ok) return;

          const data = await res.json();
          results = data.results;

          // Lưu vào cache
          setCachedResult(cacheKey, results);
          console.log('API called and cached');
        } else {
          console.log('Using cached result');
        }

        if (!results) return;

        /** ――― 4. lọc toxic dựa trên response API ――― */
        const toxicTexts = results
          .filter((r: any) => r.isToxic && r.probability > 0.85)
          .map((r: any) => r.text);

        /** ――― 5. che mờ văn bản độc hại - CHỈ CLICK KHÔNG HOVER ――― */
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (tox: string[], userLoggedIn: boolean) => {
            const PASSWORD = '1234';

            function injectPasswordPopup(spanElement: HTMLElement, text: string) {
              if (document.getElementById('toxic-password-popup')) return;

              const popup = document.createElement('div');
              popup.id = 'toxic-password-popup';

              if (!userLoggedIn) {
                // Hiển thị popup yêu cầu đăng nhập
                popup.innerHTML = `
                  <div style="
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center;
                    z-index: 9999; backdrop-filter: blur(5px);
                  ">
                    <div style="
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      padding: 32px; border-radius: 16px; text-align: center;
                      width: 380px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                      border: 1px solid rgba(255,255,255,0.2);
                      animation: slideIn 0.3s ease-out;
                      position: relative;
                    ">
                      <button id="toxic-close-btn" style="
                        position: absolute; top: 12px; right: 16px;
                        background: none; border: none; color: white;
                        font-size: 24px; cursor: pointer; line-height: 1;
                        width: 32px; height: 32px; display: flex;
                        align-items: center; justify-content: center;
                        border-radius: 50%; transition: background 0.3s;
                      " onmouseover="this.style.background='rgba(255,255,255,0.2)'" 
                         onmouseout="this.style.background='none'">×</button>
                      <div style="
                        background: rgba(255,255,255,0.2); 
                        border-radius: 50%; 
                        width: 60px; height: 60px; 
                        margin: 0 auto 20px auto;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 24px;
                      ">🔒</div>
                      <h3 style="
                        margin-bottom: 16px; font-size: 1.4rem; color: white; 
                        font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                      ">Yêu cầu đăng nhập</h3>
                      <p style="
                        color: rgba(255,255,255,0.9); margin-bottom: 20px; 
                        font-size: 14px; line-height: 1.5;
                      ">Bạn cần đăng nhập để xem nội dung này</p>
                    </div>
                  </div>
                  <style>
                    @keyframes slideIn {
                      from { transform: translateY(-50px); opacity: 0; }
                      to { transform: translateY(0); opacity: 1; }
                    }
                  </style>
                `;
              } else {
                // Hiển thị popup nhập mật khẩu
                popup.innerHTML = `
                  <div style="
                    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                    background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center;
                    z-index: 9999; backdrop-filter: blur(5px);
                  ">
                    <div style="
                      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      padding: 32px; border-radius: 16px; text-align: center;
                      width: 380px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                      border: 1px solid rgba(255,255,255,0.2);
                      animation: slideIn 0.3s ease-out;
                      position: relative;
                    ">
                      <button id="toxic-close-btn" style="
                        position: absolute; top: 12px; right: 16px;
                        background: none; border: none; color: white;
                        font-size: 24px; cursor: pointer; line-height: 1;
                        width: 32px; height: 32px; display: flex;
                        align-items: center; justify-content: center;
                        border-radius: 50%; transition: background 0.3s;
                      " onmouseover="this.style.background='rgba(255,255,255,0.2)'" 
                         onmouseout="this.style.background='none'">×</button>
                      <div style="
                        background: rgba(255,255,255,0.2); 
                        border-radius: 50%; 
                        width: 60px; height: 60px; 
                        margin: 0 auto 20px auto;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 24px;
                      ">🔒</div>
                      <h3 style="
                        margin-bottom: 16px; font-size: 1.4rem; color: white; 
                        font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                      ">Nội dung được bảo vệ</h3>
                      <p style="
                        color: rgba(255,255,255,0.9); margin-bottom: 20px; 
                        font-size: 14px; line-height: 1.5;
                      ">Nhập mật khẩu để xem nội dung độc hại này</p>
                      <input type="password" id="toxic-password-input" placeholder="Nhập mật khẩu..." style="
                        margin: 0 0 20px 0; padding: 12px 16px; width: 100%; 
                        border: none; border-radius: 8px; font-size: 16px;
                        background: rgba(255,255,255,0.9); color: #333;
                        box-sizing: border-box; outline: none;
                        box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
                      " />
                      <div style="display: flex; gap: 12px; justify-content: center;">
                        <button id="toxic-password-cancel" style="
                          padding: 12px 20px; background: rgba(255,255,255,0.2); 
                          color: white; border: none; border-radius: 8px; cursor: pointer;
                          font-size: 14px; font-weight: 500; transition: all 0.3s;
                          border: 1px solid rgba(255,255,255,0.3);
                        ">Hủy</button>
                        <button id="toxic-password-submit" style="
                          padding: 12px 20px; background: #4cd964; color: white; 
                          border: none; border-radius: 8px; cursor: pointer;
                          font-size: 14px; font-weight: 500; transition: all 0.3s;
                          box-shadow: 0 4px 12px rgba(76, 217, 100, 0.3);
                        ">Xác nhận</button>
                      </div>
                    </div>
                  </div>
                  <style>
                    @keyframes slideIn {
                      from { transform: translateY(-50px); opacity: 0; }
                      to { transform: translateY(0); opacity: 1; }
                    }
                    @keyframes shake {
                      0%, 100% { transform: translateX(0); }
                      25% { transform: translateX(-10px); }
                      75% { transform: translateX(10px); }
                    }
                    #toxic-password-submit:hover {
                      background: #5de97a !important;
                      transform: translateY(-2px);
                    }
                    #toxic-password-cancel:hover {
                      background: rgba(255,255,255,0.3) !important;
                    }
                  </style>
                `;
              }
              document.body.appendChild(popup);

              // Xử lý nút đóng (X)
              document.getElementById('toxic-close-btn')?.addEventListener('click', () => {
                document.getElementById('toxic-password-popup')?.remove();
              });

              if (!userLoggedIn) {
                // Xử lý nút đăng nhập
                document.getElementById('toxic-login-btn')?.addEventListener('click', () => {
                  // Có thể trigger event để mở trang đăng nhập
                  window.postMessage({ type: 'OPEN_LOGIN' }, '*');
                  document.getElementById('toxic-password-popup')?.remove();
                });
              } else {
                // Focus vào input
                setTimeout(() => {
                  const input = document.getElementById('toxic-password-input') as HTMLInputElement;
                  if (input) input.focus();
                }, 100);

                // Xử lý submit mật khẩu
                document.getElementById('toxic-password-submit')?.addEventListener('click', () => {
                  const val = (document.getElementById('toxic-password-input') as HTMLInputElement)
                    .value;
                  if (val === PASSWORD) {
                    document.getElementById('toxic-password-popup')?.remove();
                    spanElement.style.filter = '';
                    spanElement.removeAttribute('data-unlock-text');
                  } else {
                    // Hiệu ứng shake khi sai mật khẩu
                    const input = document.getElementById('toxic-password-input');
                    if (input) {
                      input.style.animation = 'shake 0.5s';
                      input.style.borderColor = '#ff4757';
                      setTimeout(() => {
                        input.style.animation = '';
                        input.style.borderColor = '';
                      }, 500);
                    }
                  }
                });

                // Nút hủy
                document.getElementById('toxic-password-cancel')?.addEventListener('click', () => {
                  document.getElementById('toxic-password-popup')?.remove();
                });

                // Enter để submit
                document
                  .getElementById('toxic-password-input')
                  ?.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                      document.getElementById('toxic-password-submit')?.click();
                    }
                  });
              }

              // Đóng popup khi click ra ngoài
              popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                  popup.remove();
                }
              });

              // ESC để đóng popup
              const escapeHandler = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                  popup.remove();
                  document.removeEventListener('keydown', escapeHandler);
                }
              };
              document.addEventListener('keydown', escapeHandler);
            }

            const els = document.querySelectorAll('span');
            els.forEach((el) => {
              const text = (el as HTMLElement).innerText;
              if (tox.includes(text)) {
                (el as HTMLElement).style.filter = 'blur(5px)';
                (el as HTMLElement).style.pointerEvents = 'auto';
                (el as HTMLElement).style.cursor = 'pointer';
                el.setAttribute('data-unlock-text', 'true');

                // CHỈ XỬ LÝ CLICK - BỎ HOVER
                el.addEventListener('click', (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (el.getAttribute('data-unlock-text')) {
                    injectPasswordPopup(el as HTMLElement, text);
                  }
                });
              }
            });
          },
          args: [toxicTexts, isLoggedIn],
        });

        /** ――― 6. cập nhật bộ đếm & store ――― */
      } else {
        /** tắt filter: clear style */
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            document.querySelectorAll('span').forEach((el) => {
              (el as HTMLElement).style.filter = '';
              (el as HTMLElement).style.cursor = '';
              el.removeAttribute('data-unlock-text');
            });
            document.getElementById('toxic-password-popup')?.remove();
          },
        });
      }
    });
  };

  // ...existing code...

  /* ---------------- toggle image filter - CẢI TIẾN VỚI DEBUG ---------------- */
  const handleImageFilterToggle = async (checked: boolean) => {
    setImageFilterOn(checked);
    chrome.storage.local.set({ isImageFilterOn: checked });

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (
        !tab?.id ||
        !tab.url ||
        tab.url.startsWith('chrome-extension://') ||
        tab.url.startsWith('chrome://')
      )
        return;

      if (checked) {
        try {
          /** ――― 1. trích xuất URL ảnh với hash để so sánh - CẢI THIỆN DEBUG ――― */
          const imageData: Array<{
            url: string;
            hash: string;
            isBase64: boolean;
            size: { width: number; height: number };
          }> = await new Promise((resolve) => {
            chrome.scripting.executeScript(
              {
                target: { tabId: tab.id },
                func: () => {
                  function simpleHash(str: string): string {
                    let hash = 0;
                    for (let i = 0; i < Math.min(str.length, 1000); i++) {
                      const char = str.charCodeAt(i);
                      hash = (hash << 5) - hash + char;
                      hash = hash & hash;
                    }
                    return hash.toString();
                  }

                  const allImages = Array.from(document.querySelectorAll('img'));
                  console.log(`🔍 Found ${allImages.length} img elements on page`);

                  const imageData = allImages.map((el, index) => {
                    const imgEl = el as HTMLImageElement;
                    const src = imgEl.src;
                    const isBase64 = src.startsWith('data:image/');
                    const width = imgEl.naturalWidth || imgEl.width;
                    const height = imgEl.naturalHeight || imgEl.height;

                    console.log(`Image ${index}:`, {
                      src: src.substring(0, 100) + (src.length > 100 ? '...' : ''),
                      isBase64,
                      size: `${width}x${height}`,
                      visible: imgEl.offsetWidth > 0 && imgEl.offsetHeight > 0,
                      complete: imgEl.complete,
                    });

                    return {
                      url: src,
                      hash: simpleHash(src),
                      isBase64: isBase64,
                      size: { width, height },
                    };
                  });

                  // Filter out invalid images
                  const validImages = imageData.filter((img) => {
                    const isValid =
                      img.url &&
                      img.url !== 'about:blank' &&
                      !img.url.includes('chrome-extension://') &&
                      img.size.width > 10 &&
                      img.size.height > 10;

                    if (!isValid) {
                      console.log(`❌ Filtered out invalid image:`, img.url.substring(0, 50));
                    }
                    return isValid;
                  });

                  console.log(`✅ Valid images: ${validImages.length}/${imageData.length}`);
                  return validImages;
                },
              },
              (rs) => resolve(rs?.[0]?.result ?? []),
            );
          });

          console.log(`📸 Total valid images found: ${imageData.length}`);

          // Debug: Log image types breakdown
          const imageTypes = {
            base64: imageData.filter((img) => img.isBase64).length,
            http: imageData.filter((img) => img.url.startsWith('http')).length,
            https: imageData.filter((img) => img.url.startsWith('https')).length,
            other: imageData.filter((img) => !img.isBase64 && !img.url.startsWith('http')).length,
          };
          console.log(`📊 Image types breakdown:`, imageTypes);

          if (!imageData.length) return;

          /** ――― 2. Kiểm tra cache cho từng ảnh riêng lẻ - CẢI THIỆN DEBUG ――― */
          const cachedResults = new Map<string, any>();
          const uncachedImages: Array<{ url: string; hash: string; index: number }> = [];
          let cacheHits = 0;

          for (let i = 0; i < imageData.length; i++) {
            const img = imageData[i];
            const cachedResult = await getCachedImageResult(img.hash);

            if (cachedResult !== null) {
              cachedResults.set(img.hash, cachedResult);
              cacheHits++;
              console.log(
                `📋 Cache HIT for image ${i}: ${img.url.substring(0, 50)}... - Result: ${(cachedResult as any)?.prediction || 'N/A'}`,
              );
            } else {
              uncachedImages.push({ ...img, index: i });
              console.log(`❌ Cache MISS for image ${i}: ${img.url.substring(0, 50)}...`);
            }
          }

          console.log(`📊 Cache stats: ${cacheHits} hits, ${uncachedImages.length} misses`);

          /** ――― 3. Xử lý batch API cho ảnh chưa cache - CẢI THIỆN DEBUG ――― */
          if (uncachedImages.length > 0) {
            console.log(`🔄 Processing ${uncachedImages.length} uncached images in batches`);

            // Chia thành các batch nhỏ để tránh timeout
            const BATCH_SIZE = 5; // Giảm batch size để debug tốt hơn
            const batches = [];
            for (let i = 0; i < uncachedImages.length; i += BATCH_SIZE) {
              batches.push(uncachedImages.slice(i, i + BATCH_SIZE));
            }

            console.log(`📦 Created ${batches.length} batches for processing`);

            for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
              const batch = batches[batchIndex];
              console.log(
                `🚀 Processing batch ${batchIndex + 1}/${batches.length} with ${batch.length} images`,
              );

              try {
                // Debug: Log URLs being sent to API
                batch.forEach((img, idx) => {
                  console.log(
                    `  Batch ${batchIndex + 1} - Image ${idx + 1}: ${img.url.substring(0, 80)}...`,
                  );
                });

                const requestPayload = {
                  image_urls: batch.map((img) => img.url),
                };

                console.log(
                  `📤 Sending API request to: ${API_ENDPOINT_AI}/predict_violence_image_batch`,
                );
                console.log(
                  `📤 Request payload size: ${JSON.stringify(requestPayload).length} characters`,
                );

                const res = await fetch(`${API_ENDPOINT_AI}/predict_violence_image_batch`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(requestPayload),
                });

                console.log(`📡 API Response status: ${res.status} ${res.statusText}`);

                if (res.ok) {
                  const data = await res.json();
                  const batchResults = data.results || [];

                  console.log(`📥 API Response data:`, {
                    resultsCount: batchResults.length,
                    expectedCount: batch.length,
                    hasResults: Array.isArray(batchResults),
                  });

                  // Debug: Log detailed results
                  batchResults.forEach((result: any, index: number) => {
                    const imgUrl = batch[index]?.url?.substring(0, 60) || 'Unknown';
                    console.log(`📊 Result ${index + 1}:`, {
                      url: imgUrl + '...',
                      prediction: result?.prediction,
                      confidence: result?.confidence,
                      error: result?.error,
                      rawResult: result,
                    });
                  });

                  /** ――― 4. Cache kết quả từng ảnh - CẢI THIỆN DEBUG ――― */
                  batchResults.forEach((result: any, index: number) => {
                    if (batch[index]) {
                      const imgHash = batch[index].hash;
                      const imgUrl = batch[index].url.substring(0, 50);

                      setCachedImageResult(imgHash, result);
                      cachedResults.set(imgHash, result);

                      console.log(
                        `💾 Cached result for image: ${imgUrl}... - Prediction: ${result?.prediction || 'N/A'} - Hash: ${imgHash}`,
                      );
                    } else {
                      console.warn(`⚠️ No batch item found for result index ${index}`);
                    }
                  });
                } else {
                  const errorText = await res.text();
                  console.error(`❌ API Error ${res.status}:`, errorText);
                }
              } catch (error) {
                console.error(`❌ Error processing batch ${batchIndex + 1}:`, error);
                // Cache error result để không retry liên tục
                batch.forEach((img) => {
                  setCachedImageResult(img.hash, { error: true, errorMessage: error.message });
                  cachedResults.set(img.hash, { error: true, errorMessage: error.message });
                });
              }

              // Delay between batches to avoid overwhelming the API
              if (batchIndex < batches.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }
            }
          }

          /** ――― 5. Tạo mapping hash -> violent status - CẢI THIỆN DEBUG ――― */
          const violentHashes = new Set<string>();
          const predictionStats = {
            violence: 0,
            nonViolence: 0,
            errors: 0,
            unknown: 0,
          };

          console.log(`🔍 Analyzing ${imageData.length} images for violence detection`);

          imageData.forEach((img, index) => {
            const result = cachedResults.get(img.hash);
            const imgUrl = img.url.substring(0, 50);

            if (!result) {
              predictionStats.unknown++;
              console.log(`❓ No result found for image ${index}: ${imgUrl}...`);
            } else if (result.error) {
              predictionStats.errors++;
              console.log(
                `❌ Error result for image ${index}: ${imgUrl}... - Error: ${result.errorMessage || 'Unknown'}`,
              );
            } else if (result.prediction === 'violence') {
              predictionStats.violence++;
              violentHashes.add(img.hash);
              console.log(
                `🚨 VIOLENCE detected for image ${index}: ${imgUrl}... - Confidence: ${result.confidence || 'N/A'}`,
              );
            } else {
              predictionStats.nonViolence++;
              console.log(
                `✅ Safe image ${index}: ${imgUrl}... - Prediction: ${result.prediction} - Confidence: ${result.confidence || 'N/A'}`,
              );
            }
          });

          console.log(`📊 Final prediction stats:`, predictionStats);
          console.log(`📊 Violence detection summary:`, {
            totalImages: imageData.length,
            violentImages: violentHashes.size,
            safeImages: predictionStats.nonViolence,
            errors: predictionStats.errors,
            unknown: predictionStats.unknown,
            violenceRate: `${((violentHashes.size / imageData.length) * 100).toFixed(1)}%`,
          });

          if (violentHashes.size === 0) {
            console.log('✅ No violent images detected - Filter will not blur any images');
            return;
          }

          console.log(`🚨 Found ${violentHashes.size} violent images to blur`);
          console.log(`🚨 Violent image hashes:`, Array.from(violentHashes));

          /** ――― 6. Blur ảnh với UI ổ khóa cải tiến - CẢI THIỆN DEBUG ――― */
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (violentHashesArray: string[], userLoggedIn: boolean) => {
              const violentHashSet = new Set(violentHashesArray);
              const PASSWORD = '1234';

              console.log(
                `🎭 Starting image blur process with ${violentHashesArray.length} violent hashes`,
              );
              console.log(`🎭 Violent hashes to blur:`, violentHashesArray);

              function simpleHash(str: string): string {
                let hash = 0;
                for (let i = 0; i < Math.min(str.length, 1000); i++) {
                  const char = str.charCodeAt(i);
                  hash = (hash << 5) - hash + char;
                  hash = hash & hash;
                }
                return hash.toString();
              }

              function createLockOverlay(imgElement: HTMLImageElement): HTMLElement {
                const overlay = document.createElement('div');
                overlay.className = 'violence-lock-overlay';
                overlay.style.cssText = `
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: 100% !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              background: rgba(0, 0, 0, 0.3) !important;
              z-index: 999 !important;
              border-radius: inherit !important;
              pointer-events: none !important;
              transition: all 0.3s ease !important;
            `;

                const lockIcon = document.createElement('div');
                lockIcon.style.cssText = `
              background: rgba(255, 255, 255, 0.9) !important;
              color: #333 !important;
              border-radius: 50% !important;
              width: 60px !important;
              height: 60px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              font-size: 24px !important;
              font-weight: bold !important;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
              border: 3px solid #ff6b6b !important;
              animation: pulse 2s infinite !important;
            `;
                lockIcon.innerHTML = '🔒';

                overlay.appendChild(lockIcon);
                return overlay;
              }

              function injectPasswordPopup(imgElement: HTMLImageElement) {
                if (document.getElementById('violence-password-popup')) return;

                const popup = document.createElement('div');
                popup.id = 'violence-password-popup';

                if (!userLoggedIn) {
                  popup.innerHTML = `
                <div style="
                  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                  background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center;
                  z-index: 99999; backdrop-filter: blur(5px);
                ">
                  <div style="
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                    padding: 32px; border-radius: 16px; text-align: center;
                    width: 380px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.2);
                    animation: slideIn 0.3s ease-out;
                    position: relative;
                  ">
                    <button id="violence-close-btn" style="
                      position: absolute; top: 12px; right: 16px;
                      background: none; border: none; color: white;
                      font-size: 24px; cursor: pointer; line-height: 1;
                      width: 32px; height: 32px; display: flex;
                      align-items: center; justify-content: center;
                      border-radius: 50%; transition: background 0.3s;
                    ">×</button>
                    <div style="
                      background: rgba(255,255,255,0.2); 
                      border-radius: 50%; 
                      width: 60px; height: 60px; 
                      margin: 0 auto 20px auto;
                      display: flex; align-items: center; justify-content: center;
                      font-size: 24px;
                    ">🔒</div>
                    <h3 style="
                      margin-bottom: 16px; font-size: 1.4rem; color: white; 
                      font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    ">Yêu cầu đăng nhập</h3>
                    <p style="
                      color: rgba(255,255,255,0.9); margin-bottom: 20px; 
                      font-size: 14px; line-height: 1.5;
                    ">Bạn cần đăng nhập để xem ảnh này</p>
                  </div>
                </div>
                <style>
                  @keyframes slideIn {
                    from { transform: translateY(-50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                  }
                  @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                  }
                </style>
              `;
                } else {
                  popup.innerHTML = `
                <div style="
                  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                  background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center;
                  z-index: 99999; backdrop-filter: blur(5px);
                ">
                  <div style="
                    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                    padding: 32px; border-radius: 16px; text-align: center;
                    width: 380px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.2);
                    animation: slideIn 0.3s ease-out;
                    position: relative;
                  ">
                    <button id="violence-close-btn" style="
                      position: absolute; top: 12px; right: 16px;
                      background: none; border: none; color: white;
                      font-size: 24px; cursor: pointer; line-height: 1;
                      width: 32px; height: 32px; display: flex;
                      align-items: center; justify-content: center;
                      border-radius: 50%; transition: background 0.3s;
                    ">×</button>
                    <div style="
                      background: rgba(255,255,255,0.2); 
                      border-radius: 50%; 
                      width: 60px; height: 60px; 
                      margin: 0 auto 20px auto;
                      display: flex; align-items: center; justify-content: center;
                      font-size: 24px;
                    ">🔒</div>
                    <h3 style="
                      margin-bottom: 16px; font-size: 1.4rem; color: white; 
                      font-weight: 600; text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    ">Ảnh bạo lực được chặn</h3>
                    <p style="
                      color: rgba(255,255,255,0.9); margin-bottom: 20px; 
                      font-size: 14px; line-height: 1.5;
                    ">Nhập mật khẩu để xem ảnh này</p>
                    <input type="password" id="violence-password-input" placeholder="Nhập mật khẩu..." style="
                      margin: 0 0 20px 0; padding: 12px 16px; width: 100%; 
                      border: none; border-radius: 8px; font-size: 16px;
                      background: rgba(255,255,255,0.9); color: #333;
                      box-sizing: border-box; outline: none;
                      box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
                    " />
                    <div style="display: flex; gap: 12px; justify-content: center;">
                      <button id="violence-password-cancel" style="
                        padding: 12px 20px; background: rgba(255,255,255,0.2); 
                        color: white; border: none; border-radius: 8px; cursor: pointer;
                        font-size: 14px; font-weight: 500; transition: all 0.3s;
                        border: 1px solid rgba(255,255,255,0.3);
                      ">Hủy</button>
                      <button id="violence-password-submit" style="
                        padding: 12px 20px; background: #4cd964; color: white; 
                        border: none; border-radius: 8px; cursor: pointer;
                        font-size: 14px; font-weight: 500; transition: all 0.3s;
                        box-shadow: 0 4px 12px rgba(76, 217, 100, 0.3);
                      ">Xác nhận</button>
                    </div>
                  </div>
                </div>
                <style>
                  @keyframes slideIn {
                    from { transform: translateY(-50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                  }
                  @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                  }
                  @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                  }
                </style>
              `;
                }

                document.body.appendChild(popup);

                // Event handlers
                document.getElementById('violence-close-btn')?.addEventListener('click', () => {
                  document.getElementById('violence-password-popup')?.remove();
                });

                if (userLoggedIn) {
                  setTimeout(() => {
                    const input = document.getElementById(
                      'violence-password-input',
                    ) as HTMLInputElement;
                    if (input) input.focus();
                  }, 100);

                  document
                    .getElementById('violence-password-submit')
                    ?.addEventListener('click', () => {
                      const val = (
                        document.getElementById('violence-password-input') as HTMLInputElement
                      ).value;
                      if (val === PASSWORD) {
                        document.getElementById('violence-password-popup')?.remove();
                        imgElement.style.filter = '';
                        imgElement.style.position = '';
                        imgElement.removeAttribute('data-unlock-video');
                        // Remove lock overlay
                        const lockOverlay =
                          imgElement.parentElement?.querySelector('.violence-lock-overlay');
                        if (lockOverlay) lockOverlay.remove();
                      } else {
                        const input = document.getElementById('violence-password-input');
                        if (input) {
                          input.style.animation = 'shake 0.5s';
                          setTimeout(() => (input.style.animation = ''), 500);
                        }
                      }
                    });

                  document
                    .getElementById('violence-password-cancel')
                    ?.addEventListener('click', () => {
                      document.getElementById('violence-password-popup')?.remove();
                    });

                  document
                    .getElementById('violence-password-input')
                    ?.addEventListener('keypress', (e) => {
                      if (e.key === 'Enter') {
                        document.getElementById('violence-password-submit')?.click();
                      }
                    });
                }

                // Click outside to close
                popup.addEventListener('click', (e) => {
                  if (e.target === popup) {
                    popup.remove();
                  }
                });

                // ESC to close
                const escapeHandler = (e: KeyboardEvent) => {
                  if (e.key === 'Escape') {
                    popup.remove();
                    document.removeEventListener('keydown', escapeHandler);
                  }
                };
                document.addEventListener('keydown', escapeHandler);
              }

              // Main processing - CẢI THIỆN DEBUG
              const imgs = document.querySelectorAll('img');
              let blurredCount = 0;
              let checkedCount = 0;

              console.log(`🎭 Processing ${imgs.length} img elements for blurring`);

              imgs.forEach((el, index) => {
                const src = (el as HTMLImageElement).src;
                const hash = simpleHash(src);
                checkedCount++;

                console.log(
                  `🔍 Checking image ${index}: Hash=${hash}, Src=${src.substring(0, 50)}...`,
                );

                if (violentHashSet.has(hash)) {
                  // Skip if already processed
                  if (el.getAttribute('data-violence-processed')) {
                    console.log(`⏭️ Image ${index} already processed, skipping`);
                    return;
                  }

                  const imgElement = el as HTMLImageElement;

                  console.log(`🚨 BLURRING violent image ${index}: ${src.substring(0, 50)}...`);

                  // Blur the image
                  imgElement.style.filter = 'blur(15px)';
                  imgElement.style.cursor = 'pointer';
                  imgElement.setAttribute('data-unlock-video', 'true');
                  imgElement.setAttribute('data-violence-processed', 'true');

                  // Ensure parent is positioned
                  const parent = imgElement.parentElement;
                  if (parent) {
                    const parentStyle = getComputedStyle(parent);
                    if (parentStyle.position === 'static') {
                      parent.style.position = 'relative';
                    }
                  }

                  // Create and add lock overlay
                  const lockOverlay = createLockOverlay(imgElement);

                  // Insert overlay after the image
                  if (parent) {
                    parent.appendChild(lockOverlay);
                  } else {
                    imgElement.parentNode?.insertBefore(lockOverlay, imgElement.nextSibling);
                  }

                  // Add click handler to image
                  imgElement.addEventListener(
                    'click',
                    (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (imgElement.getAttribute('data-unlock-video')) {
                        injectPasswordPopup(imgElement);
                      }
                    },
                    true,
                  );

                  blurredCount++;
                } else {
                  console.log(`✅ Image ${index} is safe, not blurring`);
                }
              });

              console.log(
                `🎭 Final blur summary: Checked ${checkedCount} images, blurred ${blurredCount} images`,
              );
            },
            args: [Array.from(violentHashes), isLoggedIn],
          });
        } catch (error) {
          console.error('❌ Error in image filter:', error);
        }
      } else {
        /** tắt filter */
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            document.querySelectorAll('img').forEach((el) => {
              (el as HTMLImageElement).style.filter = '';
              (el as HTMLImageElement).style.position = '';
              (el as HTMLImageElement).style.cursor = '';
              el.removeAttribute('data-unlock-video');
              el.removeAttribute('data-violence-processed');
            });
            // Remove all lock overlays
            document
              .querySelectorAll('.violence-lock-overlay')
              .forEach((overlay) => overlay.remove());
            document.getElementById('violence-password-popup')?.remove();
          },
        });
      }
    });
  };

  // ...existing code...

  const handleFilterToggle = (k: keyof typeof toxicFilters) => {
    const newF = { ...toxicFilters, [k]: !toxicFilters[k] };
    setToxicFilters(newF);
    chrome.storage.local.set({ toxicFilters: newF });
  };

  const handleLanguageChange = (lang: 'vi' | 'en') => {
    setLanguage(lang);
    chrome.storage.local.set({ language: lang });
  };

  /* ---------------- JSX ---------------- */
  return (
    <div className="bg-white h-screen flex flex-col px-5 w-[65vh]">
      <div className="sticky top-0 z-10 flex items-center justify-between py-4">
        <button
          className={`rounded-full px-3 py-1 text-xs font-medium ${darkMode ? 'bg-black-500 text-white' : 'bg-gray-200 text-gray-900'}`}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>

      {/* avatar / email */}
      <div className="flex items-center justify-center flex-col mb-6">
        <img src="./icons/logo.png" alt="Hồ sơ" className="w-24 h-24 mb-4" />
        {!isLoggedIn ? (
          <>
            <p className={`text-sm mb-2 ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>
              Bạn đang sử dụng với tư cách <span className="font-semibold">khách</span>.
            </p>
          </>
        ) : (
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : ''}`}>{user?.email}</h2>
        )}
      </div>

      {/* switch for text filter */}
      <div className="border-b-2 border-box p-4 rounded-md">
        <div className="flex items-center justify-between cursor-pointer">
          <h5 className="font-semibold">Lọc văn bản độc hại</h5>
          <Switch
            checked={isTextFilterOn}
            onPress={handleTextFilterToggle}
            activeFillColor="#4cd964"
            inactiveFillColor="#dcdcdc"
            size={40}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <label className={`text-sm font-medium mr-4 ${darkMode ? 'text-white' : ''}`}>
            Ngôn ngữ:
          </label>
          <div className="w-40">
            <LanguageDropdown value={language} onChange={handleLanguageChange} dark={darkMode} />
          </div>
        </div>

        {isDropdownOpen && (
          <div className="mt-2 pl-4 space-y-2">
            {Object.entries(toxicFilters).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-sm capitalize">{k.replace('_', ' ')}</span>
                <Switch
                  checked={v}
                  onPress={() => handleFilterToggle(k as any)}
                  activeFillColor="#4cd964"
                  inactiveFillColor="#dcdcdc"
                  size={30}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* switch for image filter */}
      <div className="border-b-2 border-box p-4 rounded-md">
        <div className="flex items-center justify-between cursor-pointer">
          <h5 className="font-semibold">Lọc ảnh bạo lực</h5>
          <Switch
            checked={isImageFilterOn}
            onPress={handleImageFilterToggle}
            activeFillColor="#4cd964"
            inactiveFillColor="#dcdcdc"
            size={40}
          />
        </div>
      </div>

      {isLoggedIn && (
        <div className="border-b-2 border-box p-4 rounded-md">
          <div className="flex items-center justify-between cursor-pointer">
            <h5 className="font-semibold">Chế độ bảo vệ</h5>
            <Switch
              checked={isSecurityOn}
              onPress={() => {
                setIsSecurityOn(!isSecurityOn);
                navigate(
                  `/toggle-security?action=${encodeURIComponent(user.is_security_on ? 'turn-off' : 'turn-on')}`,
                );
              }}
              activeFillColor="#4cd964"
              inactiveFillColor="#dcdcdc"
              size={40}
            />
          </div>
        </div>
      )}

      {/* menu */}
      <div className="py-4 rounded-md">
        {isLoggedIn ? (
          <>
            <MenuItem
              title="Đổi mật khẩu"
              icon="./icons/lock.png"
              onClick={() => navigate('/change-password')}
            />
            <MenuItem title="Đăng xuất" icon="./icons/logout.png" onClick={handleLogout} />
          </>
        ) : (
          <MenuItem
            title="Đăng nhập"
            icon="./icons/enter.png"
            onClick={() => navigate('/sign-in')}
          />
        )}
        <MenuItem title="Gửi phản hồi" icon="./icons/message-square.png" onClick={() => {}} />
        <MenuItem title="Trợ giúp" icon="./icons/help-circle.png" onClick={() => {}} />
      </div>
    </div>
  );
};

export default Profile;
