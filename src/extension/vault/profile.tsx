import { API_ENDPOINT_AI } from '@/constants/env';
import { logoutApi } from '@/lib/services/auth.service';
import { addBlockedToxicWordsApi } from '@/lib/services/user.service';
import { logout, updateBlockedWords } from '@/store/auth-slice';
import { RootState } from '@/store/store';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/index.css';
import LanguageDropdown from './components/LanguageDropdown';
import MenuItem from './components/MenuItem';
import Switch from './components/Switch';

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

  const handleLogout = async () => {
    await logoutApi();
    dispatch(logout());
  };
  /** getter tiện dụng */
  const blocked = user?.blocked_toxic_words ?? 0;

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

        /** ――― 2. gọi API dự đoán dựa trên ngôn ngữ được chọn ――― */
        const endpoint =
          language === 'vi' ? `${API_ENDPOINT_AI}/predict_vi` : `${API_ENDPOINT_AI}/predict_en`;
        console.log('Calling endpoint:', endpoint);
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts }),
        });
        if (!res.ok) return;

        const { results } = await res.json();
        if (!results) return;

        /** ――― 3. lọc toxic dựa trên response API ――― */
        const toxicTexts = results
          .filter((r: any) => r.isToxic && r.probability > 0.85)
          .map((r: any) => r.text);

        /** ――― 4. che mờ văn bản độc hại và yêu cầu mật khẩu khi click ――― */
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (tox: string[]) => {
            const PASSWORD = '1234';

            function injectPasswordPopup(spanElement: HTMLElement, text: string) {
              // Tạo popup nếu chưa có
              if (document.getElementById('toxic-password-popup')) return;
              console.log('Injecting password popup for text:', text);
              const popup = document.createElement('div');
              popup.id = 'toxic-password-popup';
              popup.innerHTML = `
                <div style="
                  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                  background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;
                  z-index: 9999;
                ">
                  <div style="
                    background: white; padding: 20px; border-radius: 8px; text-align: center;
                    width: 300px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                  ">
                    <h3 style="margin-bottom: 10px; font-size: 1.2rem;">Nhập mật khẩu để xem nội dung</h3>
                    <input type="password" id="toxic-password-input" style="
                      margin: 10px 0; padding: 8px; width: 100%; border: 1px solid #ccc; border-radius: 4px;
                    " />
                    <br />
                    <button id="toxic-password-submit" style="
                      padding: 8px 16px; background: #4cd964; color: white; border: none; border-radius: 4px; cursor: pointer;
                    ">OK</button>
                  </div>
                </div>
              `;
              document.body.appendChild(popup);

              // Xử lý submit mật khẩu
              document.getElementById('toxic-password-submit')?.addEventListener('click', () => {
                const val = (document.getElementById('toxic-password-input') as HTMLInputElement)
                  .value;
                if (val === PASSWORD) {
                  document.getElementById('toxic-password-popup')?.remove();
                  spanElement.style.filter = ''; // Bỏ blur cho văn bản
                  spanElement.removeAttribute('data-unlock-text'); // Xóa cờ để không yêu cầu mật khẩu lại
                } else {
                  alert('Sai mật khẩu!');
                }
              });

              // Đóng popup khi click ra ngoài
              popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                  popup.remove();
                }
              });
            }

            const els = document.querySelectorAll('span');
            els.forEach((el) => {
              const text = (el as HTMLElement).innerText;
              if (tox.includes(text)) {
                (el as HTMLElement).style.filter = 'blur(5px)';
                (el as HTMLElement).style.pointerEvents = 'auto'; // Đảm bảo nhận sự kiện
                el.setAttribute('data-unlock-text', 'true');

                // Ngăn các sự kiện hover/click lan truyền
                el.addEventListener('mouseenter', (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (el.getAttribute('data-unlock-text')) {
                    injectPasswordPopup(el as HTMLElement, text);
                  }
                });
                el.addEventListener('click', (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (el.getAttribute('data-unlock-text')) {
                    injectPasswordPopup(el as HTMLElement, text);
                  }
                });
                el.addEventListener('mouseleave', () => {
                  if (el.getAttribute('data-unlock-text')) {
                    (el as HTMLElement).style.filter = 'blur(5px)';
                  }
                });
              }
            });
          },
          args: [toxicTexts],
        });

        /** ――― 5. cập nhật bộ đếm & store ――― */
        if (isLoggedIn && toxicTexts.length) {
          try {
            await addBlockedToxicWordsApi(toxicTexts.length);
            dispatch(updateBlockedWords(blocked + toxicTexts.length));
          } catch (e) {
            console.error('update count error', e);
          }
        }
      } else {
        /** tắt filter: clear style */
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            document.querySelectorAll('span').forEach((el) => {
              (el as HTMLElement).style.filter = '';
              (el as HTMLElement).style.transition = '';
              el.removeAttribute('data-unlock-text');
            });
            document.getElementById('toxic-password-popup')?.remove();
          },
        });
      }
    });
  };

  /* ---------------- toggle image filter ---------------- */
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
        /** ――― 1. trích xuất URL ảnh trên trang ――― */
        const imageUrls: string[] = await new Promise((resolve) => {
          chrome.scripting.executeScript(
            {
              target: { tabId: tab.id },
              func: () =>
                Array.from(document.querySelectorAll('img'))
                  .map((el) => (el as HTMLImageElement).src)
                  .filter((url) => url && url.startsWith('http')),
            },
            (rs) => resolve(rs?.[0]?.result ?? []),
          );
        });

        if (!imageUrls.length) return;

        /** ――― 2. gọi API dự đoán ảnh bạo lực ――― */
        console.log(
          'Extracted image URLs:',
          imageUrls,
          // `${API_ENDPOINT_AI}/predict_violence_image_batch`,
        );
        const res = await fetch(`http://tunnel.danaexperts.com:9001/predict_violence_image_batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_urls: imageUrls }),
        });
        if (!res.ok) return;

        const { results } = await res.json();
        if (!results) return;

        /** ――― 3. lọc ảnh bạo lực dựa trên response API ――― */
        const violentImages = results
          .filter((r: any) => !r.error && r.prediction === 'violence')
          .map((r: any) => r.image_url);

        /** ――― 4. che mờ ảnh bạo lực và yêu cầu mật khẩu khi click vào ảnh hoặc parent ――― */
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (violent: string[]) => {
            const PASSWORD = '1234';

            function injectPasswordPopup(imgElement: HTMLImageElement) {
              // Tạo popup nếu chưa có
              if (document.getElementById('violence-password-popup')) return;

              const popup = document.createElement('div');
              popup.id = 'violence-password-popup';
              popup.innerHTML = `
                <div style="
                  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                  background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;
                  z-index: 9999;
                ">
                  <div style="
                    background: white; padding: 20px; border-radius: 8px; text-align: center;
                    width: 300px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                  ">
                    <h3 style="margin-bottom: 10px; font-size: 1.2rem;">Nhập mật khẩu để xem ảnh</h3>
                    <input type="password" id="violence-password-input" style="
                      margin: 10px 0; padding: 8px; width: 100%; border: 1px solid #ccc; border-radius: 4px;
                    " />
                    <br />
                    <button id="violence-password-submit" style="
                      padding: 8px 16px; background: #4cd964; color: white; border: none; border-radius: 4px; cursor: pointer;
                    ">OK</button>
                  </div>
                </div>
              `;
              document.body.appendChild(popup);

              // Xử lý submit mật khẩu
              document.getElementById('violence-password-submit')?.addEventListener('click', () => {
                const val = (document.getElementById('violence-password-input') as HTMLInputElement)
                  .value;
                if (val === PASSWORD) {
                  document.getElementById('violence-password-popup')?.remove();
                  imgElement.style.filter = ''; // Bỏ blur cho ảnh
                  imgElement.removeAttribute('data-unlock-video'); // Xóa cờ để không yêu cầu mật khẩu lại
                  // Cho phép tương tác bình thường sau khi mở khóa
                  const thumbnail = imgElement.closest('ytd-thumbnail');
                  if (thumbnail) {
                    (thumbnail as HTMLElement).style.pointerEvents = 'auto';
                    thumbnail.removeEventListener('click', (e) =>
                      handleThumbnailClick(e, imgElement),
                    );
                    thumbnail.removeEventListener('mouseenter', preventHover);
                  }
                  imgElement.style.pointerEvents = 'auto';
                  imgElement.removeEventListener('click', function (e) {
                    handleImageClick(e, imgElement);
                  });
                  imgElement.removeEventListener('mouseenter', preventHover);
                } else {
                  alert('Sai mật khẩu!');
                }
              });

              // Đóng popup khi click ra ngoài
              popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                  popup.remove();
                }
              });
            }

            // Hàm xử lý click vào ảnh
            function handleImageClick(e: Event, imgElement: HTMLImageElement) {
              e.preventDefault();
              e.stopPropagation();
              if (imgElement.getAttribute('data-unlock-video')) {
                injectPasswordPopup(imgElement);
              }
            }

            // Hàm xử lý click vào thumbnail
            function handleThumbnailClick(e: Event, imgElement: HTMLImageElement) {
              e.preventDefault();
              e.stopPropagation();
              if (imgElement.getAttribute('data-unlock-video')) {
                injectPasswordPopup(imgElement);
              }
            }

            // Hàm ngăn hover
            function preventHover(e: Event) {
              e.preventDefault();
              e.stopPropagation();
            }

            const imgs = document.querySelectorAll('img');
            imgs.forEach((el) => {
              const src = (el as HTMLImageElement).src;
              if (violent.includes(src)) {
                (el as HTMLImageElement).style.filter = 'blur(10px)';
                el.setAttribute('data-unlock-video', 'true');
                el.style.pointerEvents = 'auto'; // Cho phép click trên ảnh

                // Ngăn hover và click trên parent (ytd-thumbnail) để không phát video
                const thumbnail = el.closest('ytd-thumbnail');
                if (thumbnail) {
                  (thumbnail as HTMLElement).style.pointerEvents = 'none'; // Vô hiệu hóa tương tác trên parent
                  thumbnail.addEventListener('mouseenter', preventHover, true);
                  thumbnail.addEventListener(
                    'click',
                    (e) => handleThumbnailClick(e, el as HTMLImageElement),
                    true,
                  );
                }

                // Ngăn hover trên ảnh và xử lý click
                el.addEventListener('mouseenter', preventHover, true);
                el.addEventListener(
                  'click',
                  (e) => handleImageClick(e, el as HTMLImageElement),
                  true,
                );

                // Khi rời chuột, giữ blur nếu chưa nhập mật khẩu đúng
                el.addEventListener('mouseleave', () => {
                  if (el.getAttribute('data-unlock-video')) {
                    (el as HTMLImageElement).style.filter = 'blur(10px)';
                  }
                });
              }
            });
          },
          args: [violentImages],
        });

        /** ――― 5. ghi log lỗi (nếu có) để debug ――― */
        const errors = results.filter((r: any) => r.error);
        if (errors.length) {
          console.warn('Image processing errors:', errors);
        }

        /** ――― 6. cập nhật bộ đếm & store cho ảnh bạo lực ――― */
        if (isLoggedIn && violentImages.length) {
          try {
            await addBlockedToxicWordsApi(violentImages.length);
            dispatch(updateBlockedWords(blocked + violentImages.length));
          } catch (e) {
            console.error('update count error for violent images', e);
          }
        }
      } else {
        /** tắt filter: clear style */
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            document.querySelectorAll('img').forEach((el) => {
              (el as HTMLImageElement).style.filter = '';
              (el as HTMLImageElement).style.transition = '';
              el.removeAttribute('data-unlock-video');
              const thumbnail = (el as HTMLImageElement).closest('ytd-thumbnail');
              if (thumbnail) {
                (thumbnail as HTMLElement).style.pointerEvents = 'auto'; // Khôi phục tương tác
              }
            });
            document.getElementById('violence-password-popup')?.remove();
          },
        });
      }
    });
  };

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
              Bạn đang sử dụng với tư cách <span className="font-semibold"></span>.
            </p>
          </>
        ) : (
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : ''}`}>{user?.email}</h2>
        )}
      </div>

      {/* thống kê blocked words */}
      {isLoggedIn && (
        <div className="mb-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded-md flex items-center gap-3">
            <img src="./icons/verified.png" className="w-6 h-6" />
            <p className="text-sm text-gray-700">
              Đã chặn <span className="font-bold text-indigo-600">{blocked}</span> nội dung độc hại
            </p>
          </div>
        </div>
      )}

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
