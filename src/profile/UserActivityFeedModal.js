// UserActivityFeedModal.jsx

import Feed from "../Homepage/feed";

export default function UserActivityFeedModal({
  userId,
  initialPostId,
  onClose,
}) {
  const server = process.env.REACT_APP_SERVER;

  const fetchUrlBuilder = (page) => ({
    url: `${server}/api/posts/user/${userId}`,
    params: { page },
  });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content modal-feed"
        onClick={(e) => e.stopPropagation()}
      >
        <Feed
          fetchUrlBuilder={fetchUrlBuilder}
          autoFetchOnMount={true}
        />
      </div>
    </div>
  );
}
