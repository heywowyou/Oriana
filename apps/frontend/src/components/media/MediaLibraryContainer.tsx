"use client";

// Import necessary React hooks and types.
import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { IMediaItem, MediaType } from "@/types/media";

// Import Lucide icons for UI elements.
import {
  X,
  Plus,
  Film,
  Tv,
  SquareLibrary,
  LucideIcon,
  BookOpen,
  Gamepad2,
  Music2,
} from "lucide-react";

// Import child components.
import MediaItemCard from "./MediaItemCard";
import LogItemForm from "./LogItemForm";
import EditItemForm from "./EditItemForm";
import ViewItemModal from "./ViewItemModal";
import StatsPanel from "./StatsPanel"; // Import the new StatsPanel component

// Map media types to their corresponding icons.
const MEDIA_TYPE_ICONS: Partial<Record<MediaType, LucideIcon>> = {
  movie: Film,
  show: Tv,
  anime: SquareLibrary,
  book: BookOpen,
  game: Gamepad2,
  music_album: Music2,
};

// Define media types considered as "watched" for specific form logic.
const WATCHED_CATEGORY_SUBTYPES: MediaType[] = ["movie", "show", "anime"];

// Define properties for the MediaLibraryContainer component.
interface MediaLibraryContainerProps {
  allowedMediaTypes: MediaType[];
  pageTitle: string;
  defaultAddFormMediaType?: MediaType;
}

// Define the main MediaLibraryContainer component.
export default function MediaLibraryContainer({
  allowedMediaTypes,
  pageTitle,
  defaultAddFormMediaType,
}: MediaLibraryContainerProps) {
  // --- State Declarations ---
  const [allItems, setAllItems] = useState<IMediaItem[]>([]);
  const [displayedElements, setDisplayedElements] = useState<IMediaItem[]>([]);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingElement, setEditingElement] = useState<IMediaItem | null>(null);
  const [viewingElement, setViewingElement] = useState<IMediaItem | null>(null);

  // --- Refs Declarations ---
  const addEditModalRef = useRef<HTMLDivElement | null>(null);
  const viewModalRef = useRef<HTMLDivElement | null>(null);

  // --- Hooks and Context ---
  const { idToken, loading: authLoading, currentUser } = useAuth();
  const currentYear = new Date().getFullYear();

  // --- Statistics Calculation ---
  const totalDisplayed = displayedElements.length;
  const countThisYear = displayedElements.filter(
    (element) =>
      element.dateConsumed &&
      new Date(element.dateConsumed).getFullYear() === currentYear
  ).length;
  const countBySpecificType = displayedElements.reduce(
    (accumulator: Record<string, number>, element) => {
      accumulator[element.mediaType] =
        (accumulator[element.mediaType] || 0) + 1;
      return accumulator;
    },
    {}
  );
  // Generate the title for the stats panel
  const statsTitle = "Stats";

  // --- Data Fetching ---
  const fetchAllUserMediaItems = useCallback(async () => {
    if (!idToken || !currentUser) {
      setAllItems([]);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/media/me`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "MediaLibraryContainer: Failed to fetch. Status:",
          response.status,
          "Response:",
          errorText
        );
        setAllItems([]);
        return;
      }
      const data: IMediaItem[] = await response.json();
      setAllItems(data);
    } catch (error) {
      console.error("MediaLibraryContainer: Error fetching items:", error);
      setAllItems([]);
    }
  }, [idToken, currentUser]);

  // --- Effects ---
  useEffect(() => {
    if (!authLoading && idToken && currentUser) {
      fetchAllUserMediaItems();
    } else if (!authLoading && (!idToken || !currentUser)) {
      setAllItems([]);
    }
  }, [authLoading, idToken, currentUser, fetchAllUserMediaItems]);

  useEffect(() => {
    const filteredItems = allItems.filter((item) =>
      allowedMediaTypes.includes(item.mediaType)
    );
    setDisplayedElements(filteredItems);
  }, [allItems, allowedMediaTypes]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowAddEditModal(false);
        setEditingElement(null);
        setViewingElement(null);
      }
    };
    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, []);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        showAddEditModal &&
        addEditModalRef.current &&
        !addEditModalRef.current.contains(event.target as Node)
      ) {
        setShowAddEditModal(false);
        setEditingElement(null);
      }
      if (
        viewingElement &&
        viewModalRef.current &&
        !viewModalRef.current.contains(event.target as Node)
      ) {
        setViewingElement(null);
      }
    },
    [showAddEditModal, viewingElement]
  );

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  // --- Item Action Handlers ---
  const handleOpenAddModal = () => {
    setEditingElement(null);
    setViewingElement(null);
    setShowAddEditModal(true);
  };

  const handleEditItem = (item: IMediaItem) => {
    setEditingElement(item);
    setViewingElement(null);
    setShowAddEditModal(true);
  };

  const handleViewItem = (item: IMediaItem) => {
    setViewingElement(item);
    setEditingElement(null);
    setShowAddEditModal(false);
  };

  const handleToggleFavorite = async (id: string, newStatus: boolean) => {
    if (!idToken) return;

    const originalAllItems = [...allItems];
    setAllItems((previousItems) =>
      previousItems.map((element) =>
        element._id === id ? { ...element, favorite: newStatus } : element
      )
    );

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/media/${id}/favorite`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ favorite: newStatus }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Favorite toggle failed, non-JSON response",
        }));
        throw new Error(errorData.message || "Failed to toggle favorite");
      }
    } catch (error) {
      console.error("Failed to update favorite. Reverting...", error);
      setAllItems(originalAllItems);
    }
  };

  // --- Grouping and Sorting for Display ---
  const groupedAndSortedElements = Object.entries(
    displayedElements
      .sort((a, b) => {
        const dateA = a.dateConsumed ? new Date(a.dateConsumed).getTime() : 0;
        const dateB = b.dateConsumed ? new Date(b.dateConsumed).getTime() : 0;
        if (dateB !== dateA) return dateB - dateA;
        const loggedA = new Date(a.dateLogged || a.createdAt).getTime();
        const loggedB = new Date(b.dateLogged || b.createdAt).getTime();
        return loggedB - loggedA;
      })
      .reduce((accumulator: Record<string, IMediaItem[]>, element) => {
        const year = element.dateConsumed
          ? new Date(element.dateConsumed).getFullYear().toString()
          : "No Date";
        if (!accumulator[year]) accumulator[year] = [];
        accumulator[year].push(element);
        return accumulator;
      }, {})
  ).sort((a, b) => {
    if (a[0] === "No Date") return 1;
    if (b[0] === "No Date") return -1;
    return parseInt(b[0]) - parseInt(a[0]);
  });

  if (authLoading) {
    return (
      <div className="text-center text-zinc-300 mt-20 p-10 text-lg">
        Loading your library...
      </div>
    );
  }
  if (!currentUser && !authLoading) {
    return (
      <div className="text-center text-zinc-300 mt-20 p-10 text-lg">
        Please log in to view your library.
      </div>
    );
  }

  const actualDefaultAddFormMediaType =
    defaultAddFormMediaType || allowedMediaTypes[0] || "movie";

  const logFormAvailableSubtypes = allowedMediaTypes.some((type) =>
    WATCHED_CATEGORY_SUBTYPES.includes(type)
  )
    ? WATCHED_CATEGORY_SUBTYPES.filter((subType) =>
        allowedMediaTypes.includes(subType)
      )
    : [];

  const editFormAvailableSubtypes =
    editingElement &&
    WATCHED_CATEGORY_SUBTYPES.includes(editingElement.mediaType)
      ? WATCHED_CATEGORY_SUBTYPES.filter((subType) =>
          allowedMediaTypes.includes(subType)
        )
      : [];

  return (
    <>
      {showAddEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50 px-4">
          <div
            ref={addEditModalRef}
            className="relative bg-powder rounded-lg shadow-lg p-6 w-full max-w-md"
          >
            <button
              onClick={() => {
                setShowAddEditModal(false);
                setEditingElement(null);
              }}
              className="absolute top-3 right-3 text-zinc-500 hover:text-sky-400 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
            {editingElement ? (
              <EditItemForm
                itemToEdit={editingElement}
                onItemUpdated={() => {
                  fetchAllUserMediaItems();
                  setShowAddEditModal(false);
                  setEditingElement(null);
                }}
                availableSubTypes={editFormAvailableSubtypes}
              />
            ) : (
              <LogItemForm
                onItemCreated={() => {
                  fetchAllUserMediaItems();
                  setShowAddEditModal(false);
                }}
                defaultMediaType={actualDefaultAddFormMediaType}
                availableSubTypes={logFormAvailableSubtypes}
              />
            )}
          </div>
        </div>
      )}

      {viewingElement && (
        <ViewItemModal
          item={viewingElement}
          onClose={() => setViewingElement(null)}
          modalRef={viewModalRef}
          onEdit={handleEditItem}
        />
      )}

      <div className="flex justify-center mt-10">
        <div className="relative flex flex-col gap-10 w-full max-w-[1200px] pb-20 px-4">
          {/* Render the StatsPanel here */}
          {displayedElements.length > 0 && ( // Optionally only show if there are items
            <StatsPanel
              totalDisplayed={totalDisplayed}
              countThisYear={countThisYear}
              countBySpecificType={countBySpecificType}
              allowedMediaTypes={allowedMediaTypes}
              mediaTypeIcons={MEDIA_TYPE_ICONS}
              statsTitle={statsTitle}
            />
          )}
          <div className="fixed bottom-8 right-8 z-40">
            <button
              onClick={handleOpenAddModal}
              className="w-14 h-14 flex items-center justify-center bg-sky-500 hover:bg-sky-400 text-white rounded-full shadow-xl hover:scale-110 transition-all ease-in-out duration-200"
              aria-label="Add new item"
            >
              <Plus className="w-7 h-7" />
            </button>
          </div>
          {displayedElements.length === 0 && !authLoading && currentUser && (
            <div className="text-center text-zinc-400 mt-10 text-lg bg-powder rounded-xl px-6 py-20">
              You haven't logged any items in this section yet.
              <br />
              Click the '+' button to add your first one!
            </div>
          )}
          {groupedAndSortedElements.map(([year, groupOfItems]) => (
            <div
              key={year}
              className="p-0.5 bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 rounded-2xl"
            >
              <section className="bg-powder rounded-2xl px-4 sm:px-6 py-10">
                <h2 className="text-3xl font-semibold text-zinc-300 mb-8 text-center">
                  {year}
                </h2>
                <div className="flex flex-wrap gap-x-4 gap-y-8 sm:gap-x-6 justify-center w-full">
                  {groupOfItems.map((item) => (
                    <MediaItemCard
                      key={item._id}
                      item={item}
                      onEdit={handleEditItem}
                      onClick={handleViewItem}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              </section>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
