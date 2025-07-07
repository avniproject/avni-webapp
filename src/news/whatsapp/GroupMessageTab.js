import { useEffect, useState } from "react";
import MessageService from "../../common/service/MessageService";
import ErrorMessage from "../../common/components/ErrorMessage";
import { Box } from "@mui/material";
import GroupSentMessagesTable from "../../common/components/messages/GroupSentMessagesTable";
import SendMessage from "./SendMessage";
import ReceiverType from "./ReceiverType";

const GroupMessageTab = ({ contactGroupId }) => {
  const [sentMessages, setSentMessages] = useState([]);
  const [unsentMessages, setUnSentMessages] = useState([]);
  const [error, setError] = useState(null);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    updateMessages();
  }, [refresh]);

  const onComposedMessage = () => {
    setRefresh(refresh => !refresh);
  };

  const updateMessages = () => {
    MessageService.getSentGroupMessageRequests(contactGroupId)
      .then(x => setSentMessages(x))
      .catch(setError);
    MessageService.getUnSentGroupMessageRequests(contactGroupId)
      .then(x => setUnSentMessages(x))
      .catch(setError);
  };

  return (
    <div className="container">
      <ErrorMessage error={error} />
      <SendMessage receiverId={contactGroupId} receiverType={ReceiverType.Group} onComposedMessage={onComposedMessage} />
      <Box style={{ marginTop: 20 }} />
      <GroupSentMessagesTable messages={sentMessages} title={"Sent Messages"} showDeliveryDetails={true} />
      <Box style={{ marginTop: 20 }} />
      <GroupSentMessagesTable messages={unsentMessages} title={"Scheduled Messages"} showDeliveryDetails={false} />
    </div>
  );
};

export default GroupMessageTab;
