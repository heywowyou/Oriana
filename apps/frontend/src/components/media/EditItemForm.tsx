"use client";

// Import necessary React hooks, authentication context, and types.
import { useState, FormEvent, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { uploadImage } from "@/lib/uploadImage";
import { IMediaItem, MediaType } from "@/types/media";
import MediaFormFields from "./MediaFormFields"; // Import shared form fields component.

// Define properties for the EditItemForm component.
interface EditItemFormProps {
  itemToEdit: IMediaItem; // The media item to be edited.
  onItemUpdated: () => void; // Callback function after successful item update.
  availableSubTypes?: MediaType[]; // Optional list of subtypes if media type can be changed.
}

// Define the EditItemForm component.
export default function EditItemForm({
  itemToEdit,
  onItemUpdated,
  availableSubTypes = [],
}: EditItemFormProps) {
  // --- State Declarations ---
  const [formData, setFormDataState] = useState<Partial<IMediaItem>>({
    ...itemToEdit,
    dateConsumed: itemToEdit.dateConsumed
      ? new Date(itemToEdit.dateConsumed).toISOString().split("T")[0]
      : "",
    releaseDate: itemToEdit.releaseDate
      ? new Date(itemToEdit.releaseDate).toISOString().split("T")[0]
      : "",
    tags: itemToEdit.tags || [],
    authors: itemToEdit.authors || [],
    platforms: itemToEdit.platforms || [],
    developers: itemToEdit.developers || [],
    musicGenre: itemToEdit.musicGenre || [],
  });
  const [uploading, setUploading] = useState(false);
  const { idToken } = useAuth();

  // --- Effects ---
  useEffect(() => {
    setFormDataState({
      ...itemToEdit,
      dateConsumed: itemToEdit.dateConsumed
        ? new Date(itemToEdit.dateConsumed).toISOString().split("T")[0]
        : "",
      releaseDate: itemToEdit.releaseDate
        ? new Date(itemToEdit.releaseDate).toISOString().split("T")[0]
        : "",
      tags: itemToEdit.tags || [],
      authors: itemToEdit.authors || [],
      platforms: itemToEdit.platforms || [],
      developers: itemToEdit.developers || [],
      musicGenre: itemToEdit.musicGenre || [],
    });
  }, [itemToEdit]);

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
    if (!idToken || !itemToEdit._id) {
      console.error(
        "Authentication token or item ID is missing. Cannot update."
      );
      return;
    }
    const payload: Partial<IMediaItem> = {
      ...formData,
      mediaType: itemToEdit.mediaType,
    };
    delete payload._id;
    delete payload.user;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete (payload as any).dateLogged;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/media/${itemToEdit._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Failed to update item. Server returned non-JSON response.",
        }));
        throw new Error(errorData.message || "Failed to update item");
      }
      onItemUpdated();
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const currentMediaTypeForFields = itemToEdit.mediaType;

  // --- JSX Return ---
  // The form itself is now a flex column and will grow to fill available space in the modal.
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col flex-grow overflow-hidden p-0 sm:p-0" // Removed original p-6, flex-grow allows it to take space
    >
      {/* Scrollable Fields Area: Takes up available space and scrolls its content. */}
      <div className="flex-grow overflow-y-auto space-y-6 caret-gray-400 p-4 sm:p-6 pt-0">
        {/* pt-0 because the modal header has bottom padding/border */}
        <MediaFormFields
          formData={formData}
          setFormData={setFormField}
          currentMediaType={currentMediaTypeForFields}
          availableSubTypes={
            availableSubTypes.length > 0 ? availableSubTypes : []
          }
          uploading={uploading}
          handleFileChange={handleFileChange}
          isEditMode={true}
        />
      </div>

      {/* Submit Button Area: Stays at the bottom of the form, within the modal. */}
      <div className="text-right p-4 sm:p-6 pt-4 border-t border-ashe flex-shrink-0">
        <button
          type="submit"
          disabled={uploading}
          className="px-6 py-2 rounded-lg bg-sky-500 text-powder hover:bg-sky-400 transition-colors ease-in-out duration-200 disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
