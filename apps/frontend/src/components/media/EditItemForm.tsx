"use client";

import { useState, FormEvent, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { uploadImage } from "@/lib/uploadImage";
import { IMediaItem, MediaType } from "@/types/media";
import MediaFormFields from "./MediaFormFields";

interface EditItemFormProps {
  itemToEdit: IMediaItem;
  // Callback function to execute after the item is successfully updated
  onItemUpdated: () => void;
  // If this form is part of a category that allows choosing subtypes (e.g. "Watched" allowing movie/show/anime)
  // pass these options here. For editing, this is less common as mediaType usually doesn't change.
  // However, if you allow changing movie to show, for instance, this would be used.
  // For now, we assume mediaType doesn't change during edit.
  availableSubTypes?: MediaType[];
}

export default function EditItemForm({
  itemToEdit,
  onItemUpdated,
  availableSubTypes = [],
}: EditItemFormProps) {
  // Initialize formData with the properties of itemToEdit
  const [formData, setFormDataState] = useState<Partial<IMediaItem>>({
    // Spread all properties from itemToEdit
    ...itemToEdit,
    // Ensure dates are in YYYY-MM-DD format if they are date strings or Date objects
    dateConsumed: itemToEdit.dateConsumed
      ? new Date(itemToEdit.dateConsumed).toISOString().split("T")[0]
      : "",
    releaseDate: itemToEdit.releaseDate
      ? new Date(itemToEdit.releaseDate).toISOString().split("T")[0]
      : "",
    // Tags and other array fields should be fine as they are
    tags: itemToEdit.tags || [],
    authors: itemToEdit.authors || [],
    platforms: itemToEdit.platforms || [],
    developers: itemToEdit.developers || [],
    musicGenre: itemToEdit.musicGenre || [],
  });

  const [uploading, setUploading] = useState(false);
  const { idToken } = useAuth();

  // Effect to update formData if itemToEdit prop changes externally
  // This might happen if the modal is kept open and a different item is selected for edit,
  // though typically the modal would re-mount with the new item.
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

  // Unified function to update any field in the formData
  const setFormField = <K extends keyof IMediaItem>(
    fieldName: K,
    value: IMediaItem[K]
  ) => {
    setFormDataState((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && idToken) {
      setUploading(true);
      try {
        const url = await uploadImage(file /*, idToken */); // Pass token if uploadImage needs it
        setFormField("cover", url);
      } catch (error) {
        console.error("Error uploading image:", error);
        // Handle upload error
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!idToken || !itemToEdit._id) {
      console.error("No auth token or item ID. Cannot update item.");
      // Handle error
      return;
    }

    // The mediaType should not be changed during an edit in this basic setup.
    // If you want to allow changing mediaType, more complex logic is needed
    // to handle clearing/transforming specific fields.
    const payload: Partial<IMediaItem> = {
      ...formData,
      mediaType: itemToEdit.mediaType, // Ensure original mediaType is sent
    };

    // Remove _id, user, createdAt, updatedAt, dateLogged from payload as these shouldn't be sent for update
    // or are handled by the backend. The backend controller's getAllowedFields will also filter.
    delete payload._id;
    delete payload.user;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete (payload as any).dateLogged; // Cast to any if dateLogged is virtual and not in IMediaItem keys for Partial
    // Or ensure IMediaItem keys allow for dateLogged if it's part of formData state.
    // For safety, it's better if dateLogged is not part of formData state for submission.

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/media/${itemToEdit._id}`, // Use item's ID
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(payload), // Send the updated formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Failed to update item. Server returned non-JSON response.",
        }));
        throw new Error(errorData.message || "Failed to update item");
      }

      onItemUpdated(); // Call the callback (e.g., to refresh list and close modal)
    } catch (error) {
      console.error("Error updating item:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  // currentMediaType is fixed based on the item being edited.
  const currentMediaTypeForFields = itemToEdit.mediaType;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 caret-gray-400">
      <MediaFormFields
        formData={formData}
        setFormData={setFormField}
        // currentMediaType is derived from the item being edited and should not change.
        currentMediaType={currentMediaTypeForFields}
        // availableSubTypes is typically not used in edit mode if mediaType is fixed.
        // If you allow changing movie to show, for example, you'd pass availableSubTypes here.
        availableSubTypes={
          availableSubTypes.length > 0 ? availableSubTypes : []
        }
        uploading={uploading}
        handleFileChange={handleFileChange}
        isEditMode={true} // Indicate this is an edit form
      />
      <div className="text-right">
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
