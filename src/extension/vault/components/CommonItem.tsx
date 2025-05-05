import {getDomainFromUrl} from "../../../common/common-function";
import React from "react";
import "../css/vault.css";

interface CommonItemProps {
  item: any;
  onPress?: () => void;
  otherStyles?: string;
  containerStyles?: string;
  currentScreen?: string;
  isHidePasswordHealth?: boolean;
  isHideRightIcon?: boolean;
  itemStyles?: string;
}

const CommonItem: React.FC<CommonItemProps> = ({
  item,
  onPress,
  itemStyles,
  isHideRightIcon,
}) => {
  const getIconSrc = (itemType: string) => {
    switch (itemType) {
      case "Contact":
        return "./icons/contact_color.png";
      case "Payment":
        return "./icons/credit_card_color.png";
      case "Address":
        return "./icons/location.png";
      case "Password":
      case "password":
        return getDomainFromUrl(item.detail_2);
      default:
        return "./icons/facebook.png";
    }
  };

  return (
    <div
      onClick={onPress}
      style={{borderRadius: "15px"}}
      className="py-3 relative bg-white flex items-center px-4 cursor-pointer">
      <div
        style={{borderRadius: "15px"}}
        className="p-3 bg-card_bg flex justify-center items-center">
        <img src={getIconSrc(item.item_type)} className="w-7 h-7" alt="icon" />
      </div>

      <div className="ml-5 flex-1 flex flex-col justify-between h-full">
        {/* Name */}
        <p className="font-bold leading-none mb-3">{item.name}</p>

        {/* Username with increased space */}
        <p
          className={`text-gray-500 truncate leading-none ${item.item_type === "Payment" ? "text-danger" : ""}`}
          style={{
            flexGrow: 1,
            whiteSpace: "nowrap", // Prevent text from wrapping
            overflow: "hidden", // Hide overflowed text
            textOverflow: "ellipsis", // Display "..." for overflowed text
          }}>
          {item.item_type === "Contact"
            ? item.detail_1 + " " + item.detail_2
            : item.item_type === "Payment"
              ? item.detail_1
              : item.item_type === "Address"
                ? item.detail_1 + " " + item.detail_2
                : item.detail_1}
        </p>
      </div>

      {/* Password Health Icon */}
      {!isHideRightIcon && (
        <div
          className={`absolute right-1 flex justify-center items-center ${itemStyles}`} // Changed right-3 to right-5 for more space
        >
          <img src={"./icons/copy.png"} className="w-5 h-5" alt="health" />
        </div>
      )}
    </div>
  );
};

export default CommonItem;
