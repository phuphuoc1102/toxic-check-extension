import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import SearchInput from "./components/SearchInput";

import {decryptItemField} from "@/lib/decryption/password.decryption";
import {IItem} from "@/model/item";
import {getKeysFromStorage} from "@/storage/secure-storage";
import {setItems} from "@/store/password-slice";
import {RootState} from "@/store/store";
import {useDispatch, useSelector} from "react-redux";
import {getRecentlyUsed} from "../../lib/services/item.service";
import "./css/vault.css";
import CommonItem from "./components/CommonItem";
import Overview from "./components/Overview";
import EmptyState from "./components/EmptyState";
import Spinner from "./components/Spinner"; // Giả sử bạn có một component Spinner

const Vault = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); // Thêm trạng thái loading

  const items = useSelector((state: RootState) => state.items.items);
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchPasswords = async () => {
    try {
      setLoading(true); // Bắt đầu tải, set loading = true
      if (items.length > 0) {
        setLoading(false); // Nếu đã có dữ liệu, tắt loading
        return;
      }
      console.log("Fetching data from API");
      const response = await getRecentlyUsed();
      if (response.data) {
        const {privateKey} = await getKeysFromStorage(user.email);
        const decryptedItems: IItem[] = await Promise.all(
          response.data.map(
            async item => await decryptItemField(item, privateKey),
          ),
        );
        dispatch(setItems(decryptedItems));
      }
    } catch (error) {
      console.error("Error fetching passwords: ", error);
    } finally {
      setLoading(false); // Kết thúc quá trình tải, set loading = false
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      fetchPasswords();
    }
  }, [items.length]);

  return (
    <div className="flex w-[58vh] items-center justify-center bg-[#ffffff] vault-wrapper">
      <div className="relative w-full max-w-md shadow-lg rounded-lg">
        <div className="flex flex-col items-center justify-start">
          <SearchInput
            value={searchText}
            placeholder="Search..."
            handleChangeText={setSearchText}
            otherStyles="w-full px-3"
            isSearch={true}
          />
        </div>

        <div className="mx-4 mt-5">
          <h4 className="font-bold text-text mb-3">
            What do you want to save?
          </h4>
          <Overview countItem={3} />
        </div>

        <div
          id="itemList"
          className="item-list mx-4 mt-5"
          style={{paddingBottom: "60px"}}>
          <h4 className="font-bold text-black">Recently Used</h4>
          {loading ? (
            <div className="mt-5">
              <Spinner />
            </div>
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            items.map((item, index) => (
              <CommonItem
                key={index}
                item={item}
                onPress={() => {
                  console.log("Item pressed");
                  navigate("/add-password");
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Vault;
