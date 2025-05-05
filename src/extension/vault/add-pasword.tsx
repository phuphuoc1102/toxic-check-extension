import {decryptItemField} from "@/lib/decryption/password.decryption";
import {encryptPasswordFields} from "@/lib/encryption/password.encryption";
import {IItem} from "@/model/item";
import {CreatePasswordParams} from "@/payload/request/password";
import {getKeysFromStorage} from "@/storage/secure-storage";
import {addItem} from "@/store/password-slice";
import {RootState} from "@/store/store";
import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import "../../assets/css/index.css";
import {createPassword} from "../../lib/services/password.service";
import Button from "./components/Button";
import ButtonBar from "./components/ButtonBar";
import Input from "./components/Input";
import Popup from "./components/Popup";
import SearchInput from "./components/SearchInput";
import Switch from "./components/Switch";
import "./css/vault.css";

const AddPassword = () => {
  const navigate = useNavigate();

  // State quản lý input
  const [name, setName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [isAutoFill, setIsAutoFill] = useState<boolean>(false);
  const [isAutoLogin, setIsAutoLogin] = useState<boolean>(false);
  const [isRequiredMasterPassword, setIsRequiredMasterPassword] =
    useState<boolean>(false);
  const [folderId, setFolderId] = useState<string>(""); // Bạn có thể thay đổi giá trị mặc định nếu cần
  const user = useSelector((state: RootState) => state.auth.user);

  // Trạng thái khác
  const [searchText, setSearchText] = useState<string>("");
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);

  const handleButtonClick = (label: string) => {
    let urlValue = "";

    if (label === "+") {
      urlValue = "";
      setShowPopup(true);
    } else {
      setActiveButton(prev => (prev === label ? null : label));
      switch (label) {
        case "Twitter":
          urlValue = "https://twitter.com";
          break;
        case "Instagram":
          urlValue = "https://instagram.com";
          break;
        case "Facebook":
          urlValue = "https://facebook.com";
          break;
        case "Amazon":
          urlValue = "https://amazon.com";
          break;
        case "LinkedIn":
          urlValue = "https://linkedin.com";
          break;
        default:
          urlValue = "";
          break;
      }
      setUrl(urlValue);
    }
  };

  const dispatch = useDispatch();

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleSave = async () => {
    try {
      if (!name || !username || !password) {
        alert("Please fill in all required fields (name, username, password).");
        return;
      }

      const params = {
        name,
        username,
        password,
        url: url || undefined,
        note: note || undefined,
        is_auto_fill: isAutoFill,
        is_auto_login: isAutoLogin,
        is_required_master_password: isRequiredMasterPassword,
        folderId: folderId || undefined,
      } as CreatePasswordParams;

      const {privateKey, publicKey} = await getKeysFromStorage(user.email);
      const encryptedParams = await encryptPasswordFields(params, publicKey);
      const response = await createPassword(encryptedParams);

      const newPassword = {
        item_type: "Password",
        id: response.data.id,
        name: response.data.name,
        detail_1: response.data.username,
        detail_2: response.data.url,
        detail_3: response.data.password_health,
        detail_4: response.data.logo,
      } as IItem;
      dispatch(addItem(await decryptItemField(newPassword, privateKey)));
      console.log("Password created successfully:", response);
      navigate("/");
    } catch (error) {
      console.error("Error creating password:", error);
      alert("Failed to create password. Please try again.");
    }
  };

  const buttons = [
    "+",
    "Twitter",
    "Instagram",
    "Facebook",
    "Amazon",
    "LinkedIn",
  ];

  const popupInputs = [
    {
      id: "siteLink",
      label: "Site Link",
      placeholder: "Paste link here",
      icon: "../icons/site.png",
    },
  ];

  return (
    <div className="w-[58vh] px-3 relative flex items-center justify-center bg-[#ffffff] pb-24">
      {showPopup && (
        <div className="absolute inset-0 backdrop-blur-sm z-10 transition-opacity duration-300"></div>
      )}

      <div className="relative w-full max-w-md">
        <div className="flex mt-2 flex-row items-center">
          <ButtonBar data={buttons} onButtonPress={handleButtonClick} />
        </div>
        <div className="mt-2">
          <Input
            id="name"
            label="Site/App Name"
            placeholder="Enter your site/app name"
            icon="../icons/app.png"
            onChangeText={setName}
          />
        </div>
        <div className="mt-2">
          <Input
            id="username"
            label="Username"
            placeholder="Enter your username"
            icon="../icons/user.png"
            onChangeText={setUsername}
          />
        </div>
        <div className="mt-2">
          <Input
            id="password"
            // secureTextEntry={true}
            label="Password"
            placeholder="Enter your password"
            icon="../icons/lock.png"
            onChangeText={setPassword}
          />
        </div>
        <div className="mt-2">
          <Input
            id="url"
            label="Site Link"
            placeholder="Paste the site link here"
            icon="../icons/site.png"
            value={url}
            onChangeText={setUrl}
          />
        </div>
        <div className="mt-2">
          <Input
            id="note"
            label="Note"
            placeholder="Add a note (optional)"
            icon="../icons/note.png"
            onChangeText={setNote}
          />
        </div>
        <div className="mt-2">
          <div className="border-b-2 border-box px-2 py-3 rounded-md">
            <div className="flex items-center justify-between">
              <h5 className="font-semibold">Auto Fill Pass</h5>
              <Switch
                checked={isAutoFill}
                onPress={setIsAutoFill}
                activeFillColor="#4cd964"
                inactiveFillColor="#dcdcdc"
                size={50} // Adjusted switch size
              />
            </div>
          </div>
        </div>

        <div className="mt-2">
          <div className="border-b-2 border-box px-2 py-3 rounded-md">
            <div className="flex items-center justify-between">
              <h5 className="font-semibold">Auto Login</h5>
              <Switch
                checked={isAutoLogin}
                onPress={setIsAutoLogin}
                activeFillColor="#4cd964"
                inactiveFillColor="#dcdcdc"
                size={50}
              />
            </div>
          </div>
        </div>

        <div className="mt-2">
          <div className="border-b-2 border-box px-2 py-3 rounded-md">
            <div className="flex items-center justify-between">
              <h5 className="font-semibold">Require Master Password</h5>
              <Switch
                checked={isRequiredMasterPassword}
                onPress={setIsRequiredMasterPassword}
                activeFillColor="#4cd964"
                inactiveFillColor="#dcdcdc"
                size={50}
              />
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-center items-center">
          <Button
            label="SAVE"
            onClick={handleSave}
            isActive={true}
            width="90%"
          />
        </div>
      </div>

      {showPopup && <Popup inputs={popupInputs} onClose={closePopup} />}
    </div>
  );
};

export default AddPassword;
