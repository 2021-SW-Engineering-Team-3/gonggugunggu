import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Close } from '@styled-icons/evaicons-solid';
import { authService, rt_db } from '../fbase';
import { ref, set, child, push, get, serverTimestamp, onValue, query, orderByChild } from 'firebase/database';

const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1001;
`;

const CloseIcon = styled(Close)`
  position: absolute;
  right: 40px;
  top: 40px;
  width: 2rem;
  cursor: pointer;
`;

const ModalContainer = styled.div`
  flex-direction: column;
  width: 600px;
  height: 800px;
  background-color: white;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1002;
  border-radius: 20px;
  position: fixed;
  transform: translate(-50%, -50%);
  left: 50%;
  top: 50%;
  box-shadow: 1px 1px 15px -2px grey;
`;

const ChattingInput = styled.input`
  font-size: 20px;
  padding: 10px;
  margin: 15px;
  width: 75%;
  background-color: #e2e2e2;
  border-radius: 5px;
  border: none;
`;

const Button = styled.button`
  font-size: 15px;
  padding: 12px 50px;
  color: black;
  justify-content: center;
  font-size: 18px;
  margin: 8px 0;
  width: 40%;
  border: 2px solid black;
  margin: 10px;
  border-radius: 5px;

  &:hover {
    background-color: ${({ color }) => color};
    color: white;
    transition: all ease-out 0.4s 0s;
  }
`;

const SendButton = styled.button`
  font-size: 15px;
  padding: 10px 10px;
  color: black;
  justify-content: center;
  font-size: 18px;
  margin: 8px 0;
  width: 20%;
  border: 2px solid black;
  margin: 10px;
  border-radius: 5px;

  &:hover {
    background-color: ${({ color }) => color};
    color: white;
    transition: all ease-out 0.4s 0s;
  }
`;

const ChattingBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
  margin-top: 30px;
  width: 100%;
  height: 100%;
`;

const TextSpace = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
  width: 95%;
`;

const ChattingSpace = styled.div`
  font-size: 20px;
  padding: 30px;
  margin-top: 50px;
  height: 450px;
  width: 90%;
  border-radius: 3%;
  border: 2px solid black;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: right;
  align-items: right;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    border-radius: 6px;
    background-color: rgba(255, 255, 255, 0.4);
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 6px;
  }
`;

const Title = styled.div`
  font-size: 30px;
  position: absolute;
  left: 40px;
  top: 40px;
  font-weight: 700;
`;

const MyChat = styled.div`
  margin-bottom: 10px;
  background-color: #e2e2e2;
  max-width: 80%;
  float: right;
  height: auto;
  overflow: word-break;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  padding: 10px 15px;
`;

const ChatContainer = styled.div``;

const OpponentChat = styled.div`
  margin-bottom: 10px;
  background-color: #e2e2e2;
  max-width: 80%;
  float: left;
  height: auto;
  overflow: word-break;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  padding: 10px 15px;
`;

const ChattingModal = ({ handleModalClick, opponentObj }) => {
  const [tempInput, setTempInput] = useState('');
  const [chatList, setChatList] = useState(null);
  const [roomKey, setRoomKey] = useState(null);
  const useChattingBox = useRef();

  const user = authService.currentUser;

  const getRoomKey = () => {
    const dbRef = ref(rt_db);
    let roomKey = user.uid + opponentObj.id;
    get(child(dbRef, 'messages/' + roomKey)).then((snapshot) => {
      if (snapshot.exists()) {
        console.log('1 roomKey : ' + roomKey);
      } else {
        roomKey = opponentObj.id + user.uid;
        console.log('2 roomKey : ' + roomKey);
      }
      setRoomKey(roomKey);
    });
  };

  const handleCancelButton = async (e) => {
    handleModalClick(await e);
  };

  const handleChattingInput = (e) => {
    e.preventDefault();
    setTempInput(e.target.value);
  };

  const handleSendChat = (e, message) => {
    e.preventDefault();

    // 메시지 디비 생성
    const dbRef = ref(rt_db);
    const messageKey = push(child(ref(rt_db), 'messages')).key;
    set(ref(rt_db, 'messages/' + roomKey + '/' + messageKey), {
      message: message,
      timestamp: serverTimestamp(),
      uid: user.uid,
      userName: user.displayName,
    });

    // 채팅방 유저 목록 디비 생성
    get(child(dbRef, 'roomUsers/' + roomKey))
      .then((snapshot) => {
        if (snapshot === null) {
          console.log('ChattingRoom DB already exist.');
        } else {
          set(ref(rt_db, 'roomUsers/' + roomKey), {
            uid1: user.uid,
            uid2: opponentObj.id,
          });
        }
      })
      .catch((error) => {
        console.error(error);
      });

    setTempInput('');
  };

  const fetch = async () => {
    if (roomKey) {
      const messageRef = ref(rt_db, 'messages/' + roomKey);
      onValue(query(messageRef, orderByChild('timestamp')), (snapshot) => {
        if (snapshot.val() !== null && snapshot.val() !== undefined) {
          const data = Object.values(snapshot.val());
          setChatList(data);
          useChattingBox.current.scrollTo(0, 10000);
        }
      });
    }
  };

  useEffect(() => {
    getRoomKey();
    fetch();
  }, [roomKey]);

  return (
    <>
      <Background onClick={handleCancelButton} />
      <ModalContainer>
        <ChattingBox>
          <Title>{opponentObj.name}과(와)의 채팅</Title>
          <CloseIcon onClick={handleCancelButton}></CloseIcon>
          <ChattingSpace ref={useChattingBox}>
            {chatList &&
              chatList.map((val) => {
                if (val) {
                  if (val.uid === user.uid) {
                    return (
                      <ChatContainer key={val.timestamp}>
                        <MyChat>{val.message}</MyChat>
                      </ChatContainer>
                    );
                  } else {
                    return (
                      <ChatContainer key={val.timestamp}>
                        <OpponentChat>{val.message}</OpponentChat>
                      </ChatContainer>
                    );
                  }
                }
              })}
          </ChattingSpace>
          <TextSpace>
            <ChattingInput
              name='chattingInput'
              placeholder=''
              value={tempInput}
              onChange={handleChattingInput}
            />
            <SendButton color='black' onClick={(e) => handleSendChat(e, tempInput)}>
              전송
            </SendButton>
          </TextSpace>
        </ChattingBox>
        <Button color='black' onClick={handleCancelButton}>
          나가기
        </Button>
      </ModalContainer>
    </>
  );
};

export default ChattingModal;
