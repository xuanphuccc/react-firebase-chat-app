import classNames from "classnames/bind";
import styles from "./Sidebar.module.scss";

import { Helmet } from "react-helmet-async";

import { useContext, useState } from "react";
import { AppContext } from "../../../Context/AppProvider";

import UserInfo from "../UserInfo";
import RoomList from "../RoomList";
import AlertModal from "../../Modals/AlertModal";
import UserOptions from "../../Modals/UserOptions";
import CreateRoomModal from "../../Modals/CreateRoomModal";
import SearchUsers from "../SearchUsers";

const cx = classNames.bind(styles);

function Sidebar() {
  const {
    theme,
    isRoomListLoading,
    isUsersLoading,
    isOpenSearchUsers,
    isMobile,
  } = useContext(AppContext);
  const [inputValue, setInputValue] = useState("");

  return (
    <>
      <Helmet>
        <title>Satellite - Ứng dụng nhắn tin</title>
        <meta
          name="description"
          content="Ứng dụng nhắn tin với giao diện được thiết kế theo phong cách tối giản"
        />
        <link rel="canonical" href="/login" />
      </Helmet>
      <div className={cx("side-bar", { isMobile })} data-theme={theme}>
        {isUsersLoading ? (
          <UserInfo.Loading />
        ) : (
          <UserInfo inputValue={inputValue} setInputValue={setInputValue} />
        )}

        {isRoomListLoading ? (
          <RoomList.Loading />
        ) : (
          <>
            {isOpenSearchUsers ? (
              <SearchUsers
                inputValue={inputValue}
                setInputValue={setInputValue}
              />
            ) : (
              <RoomList />
            )}
          </>
        )}

        {/* Modal */}
        <AlertModal />
        <UserOptions />
        <CreateRoomModal />
      </div>
    </>
  );
}

export default Sidebar;
