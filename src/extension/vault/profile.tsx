/* src/pages/Profile/index.tsx */
import { addBlockedToxicWordsApi } from '@/lib/services/user.service';
import { updateBlockedWords } from '@/store/auth-slice';
import { RootState } from '@/store/store';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/index.css';
import MenuItem from './components/MenuItem';
import Switch from './components/Switch';

const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((s: RootState) => s.auth.isLoggedIn);
  const user = useSelector((s: RootState) => s.auth.user);

  /** local state */
  const [isOn, setIsOn] = useState(false);
  const [isDropdownOpen, setDropdown] = useState(false);
  const [toxicFilters, setToxicFilters] = useState({
    toxic: true,
    severe_toxic: true,
    obscene: true,
    threat: true,
    insult: true,
    identity_hate: true,
  });

  /** sync chrome.storage -> local state  */
  useEffect(() => {
    chrome.storage.local.get(['isToxicFilterOn', 'toxicFilters'], (d) => {
      setIsOn(d.isToxicFilterOn || false);
      setToxicFilters(d.toxicFilters || toxicFilters);
    });
  }, []);

  /** getter tiện dụng */
  const blocked = user?.blocked_toxic_words ?? 0;

  /* ---------------- toggle extension filter ---------------- */
  const handleToggle = async (checked: boolean) => {
    setIsOn(checked);
    chrome.storage.local.set({ isToxicFilterOn: checked });

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

        if (!texts.length) return;

        /** ――― 2. gọi Python API dự đoán ――― */
        const res = await fetch('http://0.0.0.0:8999/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts }),
        });
        if (!res.ok) return;

        const { results } = await res.json();
        if (!results) return;

        /** ――― 3. lọc toxic theo threshold & filter-setting ――― */
        const toxicTexts = results
          .filter((r: any) =>
            Object.keys(toxicFilters).some(
              (key) => toxicFilters[key as keyof typeof toxicFilters] && r.details[key] > 0.85,
            ),
          )
          .map((r: any) => r.text);
        console.log('toxicText', toxicTexts);
        /** ――― 4. che mờ nội dung ――― */
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (tox: string[]) => {
            const els = document.querySelectorAll('span');
            els.forEach((el) => {
              const text = (el as HTMLElement).innerText;
              if (tox.includes(text)) {
                (el as HTMLElement).style.filter = 'blur(5px)';
                (el as HTMLElement).style.transition = 'filter .3s';
                el.addEventListener('mouseenter', () => ((el as HTMLElement).style.filter = ''));
                el.addEventListener(
                  'mouseleave',
                  () => ((el as HTMLElement).style.filter = 'blur(5px)'),
                );
              }
            });
          },
          args: [toxicTexts],
        });

        /** ――― 5. cập-nhật bộ đếm & store ――― */
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
            });
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

  /* ---------------- JSX ---------------- */
  return (
    <div className="bg-white h-screen flex flex-col px-5 w-[58vh]">
      {/* header */}
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-4">
        <h6 className="text-lg font-semibold flex-1 text-center">Hồ sơ</h6>
      </div>

      {/* avatar / email */}
      <div className="flex items-center justify-center flex-col mb-6">
        <img src="./icons/logo.png" alt="Hồ sơ" className="w-24 h-24 mb-4" />
        {!isLoggedIn ? (
          <>
            <p className="text-xs text-red-500">Bạn đang sử dụng extension với tư cách khách</p>
            <button onClick={() => navigate('sign-in')}>Đăng nhập</button>
          </>
        ) : (
          <h2 className="text-lg font-semibold">{user?.email}</h2>
        )}
      </div>

      {/* thống kê blocked words */}
      {isLoggedIn && (
        <div className="mb-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded-md flex items-center gap-3">
            <img src="./icons/shield.svg" className="w-6 h-6" />
            <p className="text-sm text-gray-700">
              Đã chặn <span className="font-bold text-indigo-600">{blocked}</span> từ độc hại
            </p>
          </div>
        </div>
      )}

      {/* switch */}
      <div className="border-b-2 border-box p-4 rounded-md">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setDropdown(!isDropdownOpen)}
        >
          <h5 className="font-semibold">Lọc văn bản độc hại</h5>
          <Switch
            checked={isOn}
            onPress={handleToggle}
            activeFillColor="#4cd964"
            inactiveFillColor="#dcdcdc"
            size={40}
          />
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

      {/* menu */}
      <div className="border-b-2 border-box py-4 rounded-md">
        <MenuItem title="Chia sẻ" icon="./icons/share.png" onClick={() => {}} />
        <MenuItem title="Xuất & Nhập" icon="./icons/hard-drive.png" onClick={() => {}} />
      </div>

      <div className="py-4 rounded-md">
        {!isLoggedIn && (
          <MenuItem
            title="Đổi mật khẩu"
            icon="./icons/lock.png"
            onClick={() => navigate('/auth/sign-in')}
          />
        )}
        <MenuItem title="Gửi phản hồi" icon="./icons/message-square.png" onClick={() => {}} />
        <MenuItem title="Trợ giúp" icon="./icons/help-circle.png" onClick={() => {}} />
      </div>
    </div>
  );
};

export default Profile;
