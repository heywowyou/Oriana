"use client";

import MediaLibraryContainer from "@/components/media/MediaLibraryContainer";
import { MediaType } from "@/types/media";

const WatchedPage = () => {
  const watchedSectionMediaTypes: MediaType[] = ["movie", "show", "anime"];

  return (
    <div>
      <MediaLibraryContainer
        allowedMediaTypes={watchedSectionMediaTypes}
        pageTitle="My Watched Collection"
        defaultAddFormMediaType="movie"
      />
    </div>
  );
};

export default WatchedPage;
