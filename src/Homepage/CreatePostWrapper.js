// // src/components/CreatePostWrapper.jsx
// import React, { useState } from "react";
// import PostUploadModal from "./PostUploadModal";

// const CreatePostWrapper = () => {
//   const [modalOpen, setModalOpen] = useState(false);

//   const handlePost = async (file, caption, tags) => {
//     // TODO: Upload image to S3 or Supabase here
//     // Then call API to create post with image URL
//     console.log("Posting:", file, caption, tags);
//   };

//   return (
//     <>
//       <button onClick={() => setModalOpen(true)}>Create Post</button>
//       <PostUploadModal
//         isOpen={modalOpen}
//         onClose={() => setModalOpen(false)}
//         onPost={handlePost}
//       />
//     </>
//   );
// };

// export default CreatePostWrapper;
