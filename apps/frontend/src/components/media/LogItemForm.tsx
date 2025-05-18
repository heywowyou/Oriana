"use client";

// Import necessary React hooks, authentication context, and types.
import { useState, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { uploadImage } from "@/lib/uploadImage";
import { IMediaItem, MediaType } from "@/types/media";
import MediaFormFields from "./MediaFormFields"; // Import shared form fields component.

// Define properties for the LogItemForm component.
interface LogItemFormProps {
  onItemCreated: () => void; // Callback function after successful item creation.
  defaultMediaType: MediaType; // Default media type for this form instance.
  availableSubTypes?: MediaType[]; // Optional list of subtypes if user can choose.
}

// Define the LogItemForm component.
export default function LogItemForm({
  onItemCreated,
  defaultMediaType,
  availableSubTypes = [],
}: LogItemFormProps) {
  // --- State Declarations ---
  const [formData, setFormDataState] = useState<Partial<IMediaItem>>({
    title: "",
    cover: "",
    mediaType: defaultMediaType,
    rating: 0,
    dateConsumed: new Date().toISOString().split("T")[0],
    status: "completed",
    favorite: false,
    notes: "",
    tags: [],
    authors: [],
    platforms: [],
    developers: [],
    musicGenre: [],
  });
  const [uploading, setUploading] = useState(false);
  const { idToken } = useAuth();

  // --- Form Field Update Handler ---
  const setFormField = <K extends keyof IMediaItem>(
    fieldName: K,
    value: IMediaItem[K]
  ) => {
    setFormDataState((previousData) => ({
      ...previousData,
      [fieldName]: value,
    }));
  };

  // --- File Change Handler ---
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && idToken) {
      setUploading(true);
      try {
        const imageUrl = await uploadImage(file);
        setFormField("cover", imageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  // --- Form Submission Handler ---
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!idToken) {
      console.error("Authentication token not found. Cannot create item.");
      return;
    }
    if (!formData.mediaType) {
      console.error("MediaType is missing. Setting to default.");
      setFormField("mediaType", defaultMediaType);
    }
    const payload: Partial<IMediaItem> = { ...formData };
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/media`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Failed to create item. Server returned non-JSON response.",
        }));
        throw new Error(errorData.message || "Failed to create item");
      }
      setFormDataState({
        title: "",
        cover: "",
        mediaType: defaultMediaType,
        rating: 0,
        dateConsumed: new Date().toISOString().split("T")[0],
        status: "completed",
        favorite: false,
        notes: "",
        tags: [],
        authors: [],
        platforms: [],
        developers: [],
        musicGenre: [],
      });
      onItemCreated();
    } catch (error) {
      console.error("Error creating item:", error);
    }
  };

  // --- JSX Return ---
  // The form itself is now a flex column and will grow to fill available space in the modal.
  // Its children (scrollable fields area and button area) will be arranged vertically.
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col flex-grow overflow-hidden p-0 sm:p-0" // Removed original p-6, flex-grow allows it to take space, overflow-hidden for child scroll
    >
      {/* Scrollable Fields Area: Takes up available space and scrolls its content. */}
      <div className="flex-grow overflow-y-auto space-y-6 caret-gray-400 p-4 sm:p-6 pt-0">
        {/* pt-0 because the modal header has bottom padding/border */}
        <MediaFormFields
          formData={formData}
          setFormData={setFormField}
          currentMediaType={formData.mediaType || defaultMediaType}
          availableSubTypes={availableSubTypes}
          uploading={uploading}
          handleFileChange={handleFileChange}
          isEditMode={false}
        />
      </div>

      {/* Submit Button Area: Stays at the bottom of the form, within the modal. */}
      <div className="text-right p-4 sm:p-6 pt-4 border-t border-ashe flex-shrink-0">
        {/* pt-4 to give some space above the button, border-t for visual separation */}
        <button
          type="submit"
          disabled={uploading}
          className="px-6 py-2 rounded-lg bg-sky-500 text-powder hover:bg-sky-400 transition-colors ease-in-out duration-200 disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Create Item"}
        </button>
      </div>
    </form>
  );
}
