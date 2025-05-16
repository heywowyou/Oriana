// Specify this component is a client-side component.
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
  // Store all media items fetched from the API.
  const [allItems, setAllItems] = useState<IMediaItem[]>([]);
  // Store items to be displayed after filtering.
  const [displayedElements, setDisplayedElements] = useState<IMediaItem[]>([]);
  // Control visibility of the add/edit modal.
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  // Store the item currently being edited, if any.
  const [editingElement, setEditingElement] = useState<IMediaItem | null>(null);
  // Store the item currently being viewed, if any.
  const [viewingElement, setViewingElement] = useState<IMediaItem | null>(null);

  // --- Refs Declarations ---
  // Reference the add/edit modal DOM element for outside click detection.
  const addEditModalRef = useRef<HTMLDivElement | null>(null);
  // Reference the view modal DOM element for outside click detection.
  const viewModalRef = useRef<HTMLDivElement | null>(null);

  // --- Hooks and Context ---
  // Access authentication status and user data.
  const { idToken, loading: authLoading, currentUser } = useAuth();
  // Get the current year for stats calculation.
  const currentYear = new Date().getFullYear();

  // --- Statistics Calculation ---
  // Calculate total number of displayed items.
  const totalDisplayed = displayedElements.length;
  // Count items consumed in the current year.
  const countThisYear = displayedElements.filter(
    (element) =>
      element.dateConsumed &&
      new Date(element.dateConsumed).getFullYear() === currentYear
  ).length;
  // Count items by their specific media type.
  const countBySpecificType = displayedElements.reduce(
    (accumulator: Record<string, number>, element) => {
      accumulator[element.mediaType] =
        (accumulator[element.mediaType] || 0) + 1;
      return accumulator;
    },
    {}
  );

  // --- Data Fetching ---
  // Fetch all media items for the current user.
  const fetchAllUserMediaItems = useCallback(async () => {
    // Halt if user is not authenticated.
    if (!idToken || !currentUser) {
      setAllItems([]);
      return;
    }
    try {
      // Make API request to fetch media items.
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/media/me`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );
      // Handle unsuccessful API response.
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
      // Parse response data and update state.
      const data: IMediaItem[] = await response.json();
      setAllItems(data);
    } catch (error) {
      // Handle errors during fetching.
      console.error("MediaLibraryContainer: Error fetching items:", error);
      setAllItems([]);
    }
  }, [idToken, currentUser]); // Rerun if idToken or currentUser changes.

  // --- Effects ---
  // Fetch media items when authentication status changes.
  useEffect(() => {
    if (!authLoading && idToken && currentUser) {
      fetchAllUserMediaItems();
    } else if (!authLoading && (!idToken || !currentUser)) {
      // Clear items if user logs out or token is lost.
      setAllItems([]);
    }
  }, [authLoading, idToken, currentUser, fetchAllUserMediaItems]);

  // Filter all items based on allowedMediaTypes prop.
  useEffect(() => {
    const filteredItems = allItems.filter((item) =>
      allowedMediaTypes.includes(item.mediaType)
    );
    setDisplayedElements(filteredItems);
  }, [allItems, allowedMediaTypes]); // Rerun if allItems or allowedMediaTypes change.

  // Add event listener for 'Escape' key to close modals.
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowAddEditModal(false);
        setEditingElement(null);
        setViewingElement(null);
      }
    };
    document.addEventListener("keydown", handleEscapeKey);
    // Remove event listener on component unmount.
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, []); // Run only once on component mount.

  // Define function to handle clicks outside of modals.
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      // Close add/edit modal if click is outside.
      if (
        showAddEditModal &&
        addEditModalRef.current &&
        !addEditModalRef.current.contains(event.target as Node)
      ) {
        setShowAddEditModal(false);
        setEditingElement(null);
      }
      // Close view modal if click is outside.
      if (
        viewingElement &&
        viewModalRef.current &&
        !viewModalRef.current.contains(event.target as Node)
      ) {
        setViewingElement(null);
      }
    },
    [showAddEditModal, viewingElement] // Rerun if modal visibility state changes.
  );

  // Add event listener for mousedown to detect outside clicks.
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    // Remove event listener on component unmount.
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]); // Rerun if handleClickOutside function changes.

  // --- Item Action Handlers ---
  // Open the modal for adding a new item.
  const handleOpenAddModal = () => {
    setEditingElement(null); // Ensure not in edit mode.
    setViewingElement(null); // Close view modal if open.
    setShowAddEditModal(true);
  };

  // Open the modal to edit an existing item.
  const handleEditItem = (item: IMediaItem) => {
    setEditingElement(item);
    setViewingElement(null); // Close view modal if open.
    setShowAddEditModal(true);
  };

  // Open the modal to view item details.
  const handleViewItem = (item: IMediaItem) => {
    setViewingElement(item);
    setEditingElement(null); // Ensure not in edit mode.
    setShowAddEditModal(false); // Close add/edit modal if open.
  };

  // Toggle the favorite status of an item.
  const handleToggleFavorite = async (id: string, newStatus: boolean) => {
    if (!idToken) return; // Halt if not authenticated.

    const originalAllItems = [...allItems]; // Keep a copy for optimistic update rollback.

    // Optimistically update UI.
    setAllItems((previousItems) =>
      previousItems.map((element) =>
        element._id === id ? { ...element, favorite: newStatus } : element
      )
    );

    try {
      // Make API request to update favorite status.
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
      // Handle unsuccessful API response.
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Favorite toggle failed, non-JSON response",
        }));
        throw new Error(errorData.message || "Failed to toggle favorite");
      }
    } catch (error) {
      // Log error and revert optimistic update if API call fails.
      console.error("Failed to update favorite. Reverting...", error);
      setAllItems(originalAllItems);
    }
  };

  // --- Grouping and Sorting for Display ---
  // Group items by year consumed and sort them.
  const groupedAndSortedElements = Object.entries(
    displayedElements
      // Primary sort: by dateConsumed (descending).
      // Secondary sort: by dateLogged or createdAt (descending) if dates are same or missing.
      .sort((a, b) => {
        const dateA = a.dateConsumed ? new Date(a.dateConsumed).getTime() : 0;
        const dateB = b.dateConsumed ? new Date(b.dateConsumed).getTime() : 0;
        if (dateB !== dateA) return dateB - dateA; // Sort by consumption date.
        const loggedA = new Date(a.dateLogged || a.createdAt).getTime();
        const loggedB = new Date(b.dateLogged || b.createdAt).getTime();
        return loggedB - loggedA; // Sort by logged/created date if consumption date is same.
      })
      // Group items by consumption year.
      .reduce((accumulator: Record<string, IMediaItem[]>, element) => {
        const year = element.dateConsumed
          ? new Date(element.dateConsumed).getFullYear().toString()
          : "No Date"; // Group items without a consumption date separately.
        if (!accumulator[year]) accumulator[year] = [];
        accumulator[year].push(element);
        return accumulator;
      }, {})
  )
    // Sort year groups: "No Date" group last, others descending by year.
    .sort((a, b) => {
      if (a[0] === "No Date") return 1; // "No Date" always at the end.
      if (b[0] === "No Date") return -1; // "No Date" always at the end.
      return parseInt(b[0]) - parseInt(a[0]); // Sort numerically by year (descending).
    });

  // --- Conditional Rendering Logic ---
  // Display loading message while authentication is in progress.
  if (authLoading) {
    return (
      <div className="text-center text-zinc-300 mt-20 p-10 text-lg">
        Loading your library...
      </div>
    );
  }
  // Display login prompt if user is not authenticated and loading is complete.
  if (!currentUser && !authLoading) {
    return (
      <div className="text-center text-zinc-300 mt-20 p-10 text-lg">
        Please log in to view your library.
      </div>
    );
  }

  // --- Form Subtype Determination ---
  // Determine the default media type for the add form.
  const actualDefaultAddFormMediaType =
    defaultAddFormMediaType || allowedMediaTypes[0] || "movie";

  // Determine available subtypes for the log item form based on allowed types.
  const logFormAvailableSubtypes = allowedMediaTypes.some((type) =>
    WATCHED_CATEGORY_SUBTYPES.includes(type)
  )
    ? WATCHED_CATEGORY_SUBTYPES.filter((subType) =>
        allowedMediaTypes.includes(subType)
      )
    : [];

  // Determine available subtypes for the edit item form based on the item being edited.
  const editFormAvailableSubtypes =
    editingElement &&
    WATCHED_CATEGORY_SUBTYPES.includes(editingElement.mediaType)
      ? WATCHED_CATEGORY_SUBTYPES.filter((subType) =>
          allowedMediaTypes.includes(subType)
        )
      : [];

  // --- JSX Return ---
  return (
    <>
      {/* Render Add/Edit Modal */}
      {showAddEditModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50 px-4">
          <div
            ref={addEditModalRef}
            className="relative bg-powder rounded-lg shadow-lg p-6 w-full max-w-md"
          >
            {/* Close button for the modal */}
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

            {/* Conditionally render Edit or Add form */}
            {editingElement ? (
              <EditItemForm
                itemToEdit={editingElement}
                onItemUpdated={() => {
                  fetchAllUserMediaItems(); // Refresh items list.
                  setShowAddEditModal(false);
                  setEditingElement(null);
                }}
                availableSubTypes={editFormAvailableSubtypes}
              />
            ) : (
              <LogItemForm
                onItemCreated={() => {
                  fetchAllUserMediaItems(); // Refresh items list.
                  setShowAddEditModal(false);
                }}
                defaultMediaType={actualDefaultAddFormMediaType}
                availableSubTypes={logFormAvailableSubtypes}
              />
            )}
          </div>
        </div>
      )}

      {/* Render View Item Modal */}
      {viewingElement && (
        <ViewItemModal
          item={viewingElement}
          onClose={() => setViewingElement(null)}
          modalRef={viewModalRef}
          onEdit={handleEditItem} // Pass edit handler to the view modal.
        />
      )}

      {/* Main content area for displaying media library */}
      <div className="flex justify-center mt-10">
        <div className="relative flex flex-col gap-10 w-full max-w-[1200px] pb-20 px-4">
          {/* Display page title if provided */}
          {pageTitle && (
            <h1 className="text-4xl font-bold text-zinc-200 text-center mb-6">
              {pageTitle}
            </h1>
          )}
          {/* Floating action button to add new items */}
          <div className="fixed bottom-8 right-8 z-40">
            <button
              onClick={handleOpenAddModal}
              className="w-14 h-14 flex items-center justify-center bg-sky-500 hover:bg-sky-400 text-white rounded-full shadow-xl hover:scale-110 transition-all ease-in-out duration-200"
              aria-label="Add new item"
            >
              <Plus className="w-7 h-7" />
            </button>
          </div>
          {/* Sticky stats bar */}
          <div className="bg-powder/50 backdrop-blur-sm text-zinc-400 text-sm rounded-lg shadow p-6 mb-8 top-4 z-30">
            <p className="font-medium text-zinc-200 text-lg mb-3">
              {/* Display title for stats section including allowed media types */}
              Stats (
              {allowedMediaTypes
                .map((type) => type.replace(/_/g, " "))
                .join(", ")}
              )
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {/* Display total count */}
              <div>
                Total:{" "}
                <span className="text-zinc-100 font-semibold block text-xl">
                  {totalDisplayed}
                </span>
              </div>
              {/* Display count for current year */}
              <div>
                This Year:{" "}
                <span className="text-zinc-100 font-semibold block text-xl">
                  {countThisYear}
                </span>
              </div>
              {/* Display count for each allowed media type */}
              {allowedMediaTypes.map((type) => {
                const IconComponent = MEDIA_TYPE_ICONS[type] || SquareLibrary;
                return (
                  <div
                    key={type}
                    className="flex flex-col items-center gap-1 hover:text-sky-400 transition-colors"
                  >
                    <IconComponent className="w-6 h-6" />
                    <span className="text-zinc-100 font-semibold">
                      {countBySpecificType[type] || 0}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Display message if no items are present and user is logged in */}
          {displayedElements.length === 0 && !authLoading && currentUser && (
            <div className="text-center text-zinc-400 mt-10 text-lg bg-powder rounded-xl px-6 py-20">
              You haven't logged any items in this section yet.
              <br />
              Click the '+' button to add your first one!
            </div>
          )}
          {/* Map through grouped and sorted elements to display items by year */}
          {groupedAndSortedElements.map(([year, groupOfItems]) => (
            <section
              key={year}
              className="bg-powder rounded-xl px-4 sm:px-6 py-10"
            >
              <h2 className="text-3xl font-semibold text-zinc-300 mb-8 text-center">
                {year}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-8 sm:gap-x-6 justify-center w-full">
                {/* Map through items in the current year group */}
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
          ))}
        </div>
      </div>
    </>
  );
}
