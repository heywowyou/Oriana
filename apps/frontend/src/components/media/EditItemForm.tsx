// Specify this component is a client-side component.
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
  // Initialize form data with values from the item being edited.
  const [formData, setFormDataState] = useState<Partial<IMediaItem>>({
    ...itemToEdit,
    // Ensure date strings are in 'YYYY-MM-DD' format for input fields.
    dateConsumed: itemToEdit.dateConsumed
      ? new Date(itemToEdit.dateConsumed).toISOString().split("T")[0]
      : "",
    releaseDate: itemToEdit.releaseDate
      ? new Date(itemToEdit.releaseDate).toISOString().split("T")[0]
      : "",
    // Initialize array fields to prevent undefined errors.
    tags: itemToEdit.tags || [],
    authors: itemToEdit.authors || [],
    platforms: itemToEdit.platforms || [],
    developers: itemToEdit.developers || [],
    musicGenre: itemToEdit.musicGenre || [],
  });
  // Manage image uploading state.
  const [uploading, setUploading] = useState(false);
  // Access authentication token.
  const { idToken } = useAuth();

  // --- Effects ---
  // Update form data if the 'itemToEdit' prop changes.
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
  }, [itemToEdit]); // Rerun if itemToEdit changes.

  // --- Form Field Update Handler ---
  // Update a specific field in the form data state.
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
  // Handle image file selection and upload.
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && idToken) {
      setUploading(true);
      try {
        // Upload image and get its URL.
        const imageUrl = await uploadImage(file);
        setFormField("cover", imageUrl); // Update cover field with the new URL.
      } catch (error) {
        console.error("Error uploading image:", error);
        // Consider adding user-facing error handling here.
      } finally {
        setUploading(false);
      }
    }
  };

  // --- Form Submission Handler ---
  // Handle form submission to update the media item.
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); // Prevent default form submission.
    if (!idToken || !itemToEdit._id) {
      console.error(
        "Authentication token or item ID is missing. Cannot update."
      );
      // Consider adding user-facing error handling here.
      return;
    }

    // Prepare payload for the API request.
    const payload: Partial<IMediaItem> = {
      ...formData,
      mediaType: itemToEdit.mediaType, // Ensure original mediaType is sent, do not allow change here.
    };

    // Remove fields that should not be sent or are handled by the backend.
    delete payload._id;
    delete payload.user;
    delete payload.createdAt;
    delete payload.updatedAt;
    // Use 'any' cast if dateLogged is not a direct key in IMediaItem for Partial.
    delete (payload as any).dateLogged;

    try {
      // Make API request to update the item.
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

      // Handle unsuccessful API response.
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Failed to update item. Server returned non-JSON response.",
        }));
        throw new Error(errorData.message || "Failed to update item");
      }

      // Execute callback on successful update.
      onItemUpdated();
    } catch (error) {
      console.error("Error updating item:", error);
      // Consider adding user-facing error handling here.
    }
  };

  // The media type for fields is fixed based on the item being edited.
  const currentMediaTypeForFields = itemToEdit.mediaType;

  // --- JSX Return ---
  return (
    <form onSubmit={handleSubmit} className="space-y-6 caret-gray-400">
      <MediaFormFields
        formData={formData}
        setFormData={setFormField}
        currentMediaType={currentMediaTypeForFields}
        // Pass available subtypes; typically empty or not used if media type is fixed for edits.
        availableSubTypes={
          availableSubTypes.length > 0 ? availableSubTypes : []
        }
        uploading={uploading}
        handleFileChange={handleFileChange}
        isEditMode={true} // Indicate this form is for editing.
      />
      <div className="text-right">
        {/* Submit button, disabled during upload. */}
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
