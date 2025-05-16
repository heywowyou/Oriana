"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { uploadImage } from "@/lib/uploadImage"; 
import { IMediaItem, MediaType } from "@/types/media";
import MediaFormFields from "./MediaFormFields";

interface LogItemFormProps {
  // Callback function to execute after a new item is successfully created (e.g., to refresh list, close modal)
  onItemCreated: () => void;
  // The default media type for this form instance (e.g., "movie", "book").
  // This will be used to initialize the form and tell MediaFormFields which specific fields to show.
  defaultMediaType: MediaType;
  // If this form is part of a category that allows choosing subtypes (e.g. "Watched" allowing movie/show/anime)
  // pass these options here. Otherwise, currentMediaType will be fixed to defaultMediaType.
  availableSubTypes?: MediaType[];
}

export default function LogItemForm({
  onItemCreated,
  defaultMediaType,
  availableSubTypes = [], // Default to empty if no subtypes are choosable
}: LogItemFormProps) {
  // Initialize formData with the defaultMediaType and other sensible defaults
  const [formData, setFormDataState] = useState<Partial<IMediaItem>>({
    title: "",
    cover: "",
    mediaType: defaultMediaType, // Pre-set the mediaType
    rating: 0,
    dateConsumed: new Date().toISOString().split("T")[0], // Default to today
    status: "completed", // Default status
    favorite: false,
    notes: "",
    tags: [],
    // Initialize other common or specific fields to empty/default if needed
    // e.g., for books: authors: [], pageCount: undefined
  });
  const [uploading, setUploading] = useState(false);
  const { idToken } = useAuth();

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
      // Ensure idToken is present for upload if needed by uploadImage
      setUploading(true);
      try {
        // Pass idToken to uploadImage if your backend storage rules require auth
        const url = await uploadImage(file /*, idToken */);
        setFormField("cover", url);
      } catch (error) {
        console.error("Error uploading image:", error);
        // Handle upload error (e.g., show a message to the user)
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!idToken) {
      console.error("No auth token found. Cannot create item.");
      // Handle error: show message to user, redirect to login, etc.
      return;
    }

    // Ensure mediaType is set (it should be by default or by user selection if availableSubTypes are used)
    if (!formData.mediaType) {
      console.error("MediaType is missing in form data.");
      // Handle this error, perhaps by setting it to defaultMediaType or showing a UI error
      setFormField("mediaType", defaultMediaType); // Fallback, though UI should guide this
      // return; // Or prevent submission
    }

    // Filter out empty strings for optional fields if backend expects undefined/null
    const payload: Partial<IMediaItem> = { ...formData };
    (Object.keys(payload) as Array<keyof IMediaItem>).forEach((key) => {
      if (payload[key] === "") {
        // For optional string fields, decide if empty string is valid or should be undefined
        // For now, let's allow empty strings for fields like 'notes', 'cover'
        // but for something like 'director', an empty string might not be desired if not set
        // This depends on your backend validation and how you want to store "empty" optional text fields
      }
      // Convert dateConsumed to Date object if it's a string, or ensure it's in correct format for backend
      if (
        key === "dateConsumed" &&
        typeof payload.dateConsumed === "string" &&
        payload.dateConsumed
      ) {
        // Backend expects ISO string or will handle Date object if Mongoose schema type is Date
        // payload.dateConsumed = new Date(payload.dateConsumed);
      }
      if (
        key === "releaseDate" &&
        typeof payload.releaseDate === "string" &&
        payload.releaseDate
      ) {
        // payload.releaseDate = new Date(payload.releaseDate);
      }
    });

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/media`, // Use the new generic endpoint
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(payload), // Send the whole formData object
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({
            message:
              "Failed to create item. Server returned non-JSON response.",
          }));
        throw new Error(errorData.message || "Failed to create item");
      }

      // Reset form to initial state (or a cleared state)
      setFormDataState({
        title: "",
        cover: "",
        mediaType: defaultMediaType, // Reset to the default for this form instance
        rating: 0,
        dateConsumed: new Date().toISOString().split("T")[0],
        status: "completed",
        favorite: false,
        notes: "",
        tags: [],
        // Reset other fields as necessary
      });
      onItemCreated(); // Call the callback (e.g., to refresh list and close modal)
    } catch (error) {
      console.error("Error creating item:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 caret-gray-400">
      <MediaFormFields
        formData={formData}
        setFormData={setFormField}
        currentMediaType={formData.mediaType || defaultMediaType} // Pass the current mediaType from state
        availableSubTypes={availableSubTypes} // Pass subtypes if this form allows choosing
        uploading={uploading}
        handleFileChange={handleFileChange}
        isEditMode={false} // This is for creating new items
      />
      <div className="text-right">
        <button
          type="submit"
          disabled={uploading} // Disable submit while uploading image
          className="px-6 py-2 rounded-lg bg-sky-500 text-powder hover:bg-sky-400 transition-colors ease-in-out duration-200 disabled:opacity-60"
        >
          {uploading ? "Uploading..." : "Create Item"}
        </button>
      </div>
    </form>
  );
}
