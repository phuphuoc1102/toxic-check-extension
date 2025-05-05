import React, {useState, useEffect} from "react";
import BackButton from "./components/BackButton";
import MenuItem from "./components/MenuItem";
import Switch from "./components/Switch";
import "../../assets/css/index.css";

const Profile: React.FC = () => {
  const [isOn, setIsOn] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [toxicFilters, setToxicFilters] = useState({
    toxic: true,
    severe_toxic: true,
    obscene: true,
    threat: true,
    insult: true,
    identity_hate: true,
  });

  useEffect(() => {
    chrome.storage.local.get(["isToxicFilterOn", "toxicFilters"], data => {
      setIsOn(data.isToxicFilterOn || false);
      setToxicFilters(data.toxicFilters || toxicFilters);
    });
  }, []);

  const handleToggle = async (checked: boolean) => {
    setIsOn(checked);
    chrome.storage.local.set({isToxicFilterOn: checked});

    chrome.tabs.query({active: true, currentWindow: true}, async tabs => {
      const tab = tabs[0];

      if (
        !tab.id ||
        !tab.url ||
        tab.url.startsWith("chrome-extension://") ||
        tab.url.startsWith("chrome://")
      ) {
        return;
      }

      if (checked) {
        try {
          const texts: string[] = await new Promise(resolve => {
            chrome.scripting.executeScript(
              {
                target: {tabId: tab.id},
                func: () => {
                  const elements = document.querySelectorAll("span");
                  return Array.from(elements)
                    .map(el => (el as HTMLElement).innerText)
                    .filter(text => text && text.trim().length > 3);
                },
              },
              results => {
                if (chrome.runtime.lastError) {
                  console.error(
                    "Lỗi thực thi script:",
                    chrome.runtime.lastError.message,
                  );
                  resolve([]);
                  return;
                }
                if (results && results[0] && results[0].result) {
                  resolve(results[0].result as string[]);
                } else {
                  resolve([]);
                }
              },
            );
          });

          console.log("Văn bản đã trích xuất:", texts);
          if (texts.length > 0) {
            const response = await fetch("http://0.0.0.0:8999/predict", {
              method: "POST",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({texts}),
            });

            if (!response.ok) {
              throw new Error(
                `Yêu cầu API thất bại với trạng thái ${response.status}`,
              );
            }

            const data = await response.json();
            if (data.results) {
              const toxicTexts = data.results
                .filter((result: any) =>
                  Object.keys(toxicFilters).some(
                    key =>
                      toxicFilters[key as keyof typeof toxicFilters] &&
                      result.details[key] > 0.85,
                  ),
                )
                .map((result: any) => result.text);

              chrome.scripting.executeScript(
                {
                  target: {tabId: tab.id},
                  func: (toxicTexts: string[]) => {
                    const elements = document.querySelectorAll("span");
                    elements.forEach(el => {
                      const text = (el as HTMLElement).innerText;
                      if (toxicTexts.includes(text)) {
                        (el as HTMLElement).style.filter = "blur(5px)";
                        (el as HTMLElement).style.transition = "filter 0.3s";
                        el.addEventListener("mouseenter", () => {
                          (el as HTMLElement).style.filter = "";
                        });
                        el.addEventListener("mouseleave", () => {
                          (el as HTMLElement).style.filter = "blur(5px)";
                        });
                      }
                    });
                  },
                  args: [toxicTexts],
                },
                () => {
                  if (chrome.runtime.lastError) {
                    console.error(
                      "Lỗi thực thi script:",
                      chrome.runtime.lastError.message,
                    );
                  }
                },
              );
            }
          }
        } catch (error) {
          console.error(
            "Lỗi khi lấy văn bản độc hại:",
            (error as Error).message || error,
          );
        }
      } else {
        chrome.scripting.executeScript(
          {
            target: {tabId: tab.id},
            func: () => {
              const elements = document.querySelectorAll("span");
              elements.forEach(el => {
                (el as HTMLElement).style.filter = "";
                (el as HTMLElement).style.transition = "";
                el.removeEventListener("mouseenter", () => {});
                el.removeEventListener("mouseleave", () => {});
              });
            },
          },
          () => {
            if (chrome.runtime.lastError) {
              console.error(
                "Lỗi thực thi script:",
                chrome.runtime.lastError.message,
              );
            }
          },
        );
      }
    });
  };

  const handleFilterToggle = (key: keyof typeof toxicFilters) => {
    const updatedFilters = {
      ...toxicFilters,
      [key]: !toxicFilters[key],
    };
    setToxicFilters(updatedFilters);
    chrome.storage.local.set({toxicFilters: updatedFilters});
  };

  return (
    <div className="bg-white h-screen flex flex-col px-5 w-[58vh]">
      <div className="sticky top-0 z-10 bg-white flex items-center justify-between py-4">
        <BackButton
          handlePress={() => alert("Quay lại")}
          containerStyles="text-lg"
        />
        <h6 className="text-lg font-semibold flex-1 text-center">Hồ sơ</h6>
      </div>
      <div className="flex items-center justify-center flex-col mb-6">
        <img src="./icons/logo.png" alt="Hồ sơ" className="w-24 h-24 mb-4" />
        <div className="text-center">
          <h2 className="text-lg font-semibold">John Doe</h2>
          <p className="text-gray-500 text-sm">john.doe@gmail.com</p>
        </div>
      </div>
      <div className="border-b-2 border-box p-4 rounded-md">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
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
          <div className="mt-2 pl-4">
            {Object.keys(toxicFilters).map(key => (
              <div key={key} className="flex items-center justify-between py-2">
                <span className="text-sm capitalize">
                  {key.replace("_", " ")}
                </span>
                <Switch
                  checked={toxicFilters[key as keyof typeof toxicFilters]}
                  onPress={() =>
                    handleFilterToggle(key as keyof typeof toxicFilters)
                  }
                  activeFillColor="#4cd964"
                  inactiveFillColor="#dcdcdc"
                  size={30}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="border-b-2 border-box py-4 rounded-md">
        <MenuItem title="Chia sẻ" icon="./icons/share.png" onClick={() => {}} />
        <MenuItem
          title="Xuất & Nhập"
          icon="./icons/hard-drive.png"
          onClick={() => {}}
        />
      </div>
      <div className="py-4 rounded-md">
        <MenuItem
          title="Đổi mật khẩu"
          icon="./icons/lock.png"
          onClick={() => {}}
        />
        <MenuItem
          title="Gửi phản hồi"
          icon="./icons/message-square.png"
          onClick={() => {}}
        />
        <MenuItem
          title="Trợ giúp"
          icon="./icons/help-circle.png"
          onClick={() => {}}
        />
      </div>
    </div>
  );
};

export default Profile;
