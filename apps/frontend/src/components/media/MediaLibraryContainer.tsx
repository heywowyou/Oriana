"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { IMediaItem, MediaType } from "@/types/media";

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

import MediaItemCard from "./MediaItemCard";
import LogItemForm from "./LogItemForm";
import EditItemForm from "./EditItemForm";
import ViewItemModal from "./ViewItemModal";

// Define a mapping from MediaType to LucideIcon
const MEDIA_TYPE_ICONS: Partial<Record<MediaType, LucideIcon>> = {
  movie: Film,
  show: Tv,
  anime: SquareLibrary,
  book: BookOpen,
  game: Gamepad2,
  music_album: Music2,
};

// Define specific subtypes for "watched" category if needed for forms
const WATCHED_CATEGORY_SUBTYPES: MediaType[] = ["movie", "show", "anime"];

interface MediaLibraryContainerProps {
  allowedMediaTypes: MediaType[];
  pageTitle: string;
  defaultAddFormMediaType?: MediaType;
}

export default function MediaLibraryContainer({
  allowedMediaTypes,
  pageTitle,
  defaultAddFormMediaType,
}: MediaLibraryContainerProps) {
  const [allItems, setAllItems] = useState<IMediaItem[]>([]);
  const [displayedElements, setDisplayedElements] = useState<IMediaItem[]>([]);
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingElement, setEditingElement] = useState<IMediaItem | null>(null);
  const [viewingElement, setViewingElement] = useState<IMediaItem | null>(null);
  const addEditModalRef = useRef<HTMLDivElement | null>(null);
  const viewModalRef = useRef<HTMLDivElement | null>(null);
  const { idToken, loading: authLoading, currentUser } = useAuth();
  const currentYear = new Date().getFullYear();

  // Stats Calculation (uses displayedElements)
  const totalDisplayed = displayedElements.length;
  const countThisYear = displayedElements.filter(
    (el) =>
      el.dateConsumed && new Date(el.dateConsumed).getFullYear() === currentYear
  ).length;
  const countBySpecificType = displayedElements.reduce(
    (acc: Record<string, number>, el) => {
      acc[el.mediaType] = (acc[el.mediaType] || 0) + 1;
      return acc;
    },
    {}
  );

  // Data Fetching
  const fetchAllUserMediaItems = useCallback(async () => {
    if (!idToken || !currentUser) {
      setAllItems([]);
      return;
    }
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/media/me`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      if (!res.ok) {
        const errorText = await res.text();
        console.error(
          "MediaLibraryContainer: Failed to fetch. Status:",
          res.status,
          "Response:",
          errorText
        );
        setAllItems([]);
        return;
      }
      const data: IMediaItem[] = await res.json();
      setAllItems(data);
    } catch (error) {
      console.error("MediaLibraryContainer: Error fetching items:", error);
      setAllItems([]);
    }
  }, [idToken, currentUser]);

  useEffect(() => {
    if (!authLoading && idToken && currentUser) {
      fetchAllUserMediaItems();
    } else if (!authLoading && (!idToken || !currentUser)) {
      setAllItems([]);
    }
  }, [authLoading, idToken, currentUser, fetchAllUserMediaItems]);

  // Client-side Filtering based on props
  useEffect(() => {
    setDisplayedElements(
      allItems.filter((item) => allowedMediaTypes.includes(item.mediaType))
    );
  }, [allItems, allowedMediaTypes]);

  // Modal Escape & Click Outside Logic
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowAddEditModal(false);
        setEditingElement(null);
        setViewingElement(null);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
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

  // Item Action Handlers
  const handleOpenAddModal = () => {
    setEditingElement(null);
    setViewingElement(null);
    setShowAddEditModal(true);
  };

  const handleEditItem = (item: IMediaItem) => {
    setEditingElement(item);
    setViewingElement(null); // Close view modal if open when starting an edit
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
    setAllItems((prevItems) =>
      prevItems.map((el) =>
        el._id === id ? { ...el, favorite: newStatus } : el
      )
    );
    try {
      const res = await fetch(
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
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({
          message: "Favorite toggle failed, non-JSON response",
        }));
        throw new Error(errorData.message || "Failed to toggle favorite");
      }
    } catch (error) {
      console.error("Failed to update favorite. Reverting...", error);
      setAllItems(originalAllItems);
    }
  };

  // Grouping and Sorting for Display
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
      .reduce((acc: Record<string, IMediaItem[]>, element) => {
        const year = element.dateConsumed
          ? new Date(element.dateConsumed).getFullYear().toString()
          : "No Date";
        if (!acc[year]) acc[year] = [];
        acc[year].push(element);
        return acc;
      }, {})
  ).sort((a, b) => {
    if (a[0] === "No Date") return 1;
    if (b[0] === "No Date") return -1;
    return parseInt(b[0]) - parseInt(a[0]);
  });

  // Render Logic
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
      {/* Add/Edit Modal */}
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

      {/* View Modal */}
      {viewingElement && (
        <ViewItemModal
          item={viewingElement} // Pass the full IMediaItem object
          onClose={() => setViewingElement(null)}
          modalRef={viewModalRef}
          onEdit={handleEditItem} // Pass the handler from MediaLibraryContainer
        />
      )}

      {/* Main content area */}
      <div className="flex justify-center mt-10">
        <div className="relative flex flex-col gap-10 w-full max-w-[1200px] pb-20 px-4">
          {pageTitle && (
            <h1 className="text-4xl font-bold text-zinc-200 text-center mb-6">
              {pageTitle}
            </h1>
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
          <div className="bg-powder/50 backdrop-blur-sm text-zinc-400 text-sm rounded-lg shadow p-6 mb-8 sticky top-4 z-30">
            <p className="font-medium text-zinc-200 text-lg mb-3">
              Stats (
              {allowedMediaTypes.map((t) => t.replace(/_/g, " ")).join(", ")})
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                Total:{" "}
                <span className="text-zinc-100 font-semibold block text-xl">
                  {totalDisplayed}
                </span>
              </div>
              <div>
                This Year:{" "}
                <span className="text-zinc-100 font-semibold block text-xl">
                  {countThisYear}
                </span>
              </div>
              {allowedMediaTypes.map((type) => {
                const Icon = MEDIA_TYPE_ICONS[type] || SquareLibrary;
                return (
                  <div
                    key={type}
                    className="flex flex-col items-center gap-1 hover:text-sky-400 transition-colors"
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-zinc-100 font-semibold">
                      {countBySpecificType[type] || 0}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          {displayedElements.length === 0 && !authLoading && currentUser && (
            <div className="text-center text-zinc-400 mt-10 text-lg bg-powder rounded-xl px-6 py-20">
              You haven't logged any items in this section yet.
              <br />
              Click the '+' button to add your first one!
            </div>
          )}
          {groupedAndSortedElements.map(([year, group]) => (
            <section
              key={year}
              className="bg-powder rounded-xl px-4 sm:px-6 py-10"
            >
              <h2 className="text-3xl font-semibold text-zinc-300 mb-8 text-center">
                {year}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-8 sm:gap-x-6 justify-center w-full">
                {group.map((item) => (
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
          ))}
        </div>
      </div>
    </>
  );
}
