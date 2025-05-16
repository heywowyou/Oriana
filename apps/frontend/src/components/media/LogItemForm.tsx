// Specify this component is a client-side component.
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
  // Initialize form data with default values.
  const [formData, setFormDataState] = useState<Partial<IMediaItem>>({
    title: "",
    cover: "",
    mediaType: defaultMediaType, // Pre-set the mediaType from props.
    rating: 0,
    dateConsumed: new Date().toISOString().split("T")[0], // Default to today's date.
    status: "completed", // Default status.
    favorite: false,
    notes: "",
    tags: [],
    // Initialize other potential fields to avoid uncontrolled component warnings.
    authors: [],
    platforms: [],
    developers: [],
    musicGenre: [],
  });
  // Manage image uploading state.
  const [uploading, setUploading] = useState(false);
  // Access authentication token.
  const { idToken } = useAuth();

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
  // Handle form submission to create a new media item.
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault(); // Prevent default form submission.
    if (!idToken) {
      console.error("Authentication token not found. Cannot create item.");
      // Consider adding user-facing error handling here.
      return;
    }

    // Ensure mediaType is set, defaulting if somehow missing.
    if (!formData.mediaType) {
      console.error("MediaType is missing. Setting to default.");
      setFormField("mediaType", defaultMediaType);
      // Potentially return or show an error to the user if mediaType is critical and should be explicitly set.
    }

    const payload: Partial<IMediaItem> = { ...formData };
    // Clean up payload: convert empty strings for optional fields to undefined if backend requires.
    // This part is highly dependent on backend expectations.
    // For now, we assume backend handles empty strings appropriately or schema defines them.
    // Example:
    // (Object.keys(payload) as Array<keyof IMediaItem>).forEach((key) => {
    //   if (payload[key] === "" && (key === 'notes' || key === 'cover')) {
    //     // Keep empty strings for these
    //   } else if (payload[key] === "") {
    //     delete payload[key]; // Or set to undefined
    //   }
    // });

    try {
      // Make API request to create the new item.
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

      // Handle unsuccessful API response.
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Failed to create item. Server returned non-JSON response.",
        }));
        throw new Error(errorData.message || "Failed to create item");
      }

      // Reset form to initial state upon successful creation.
      setFormDataState({
        title: "",
        cover: "",
        mediaType: defaultMediaType, // Reset to the default for this form instance.
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
      // Execute callback on successful creation.
      onItemCreated();
    } catch (error) {
      console.error("Error creating item:", error);
      // Consider adding user-facing error handling here.
    }
  };

  // --- JSX Return ---
  return (
    <form onSubmit={handleSubmit} className="space-y-6 caret-gray-400">
      <MediaFormFields
        formData={formData}
        setFormData={setFormField}
        currentMediaType={formData.mediaType || defaultMediaType} // Use mediaType from form or default.
        availableSubTypes={availableSubTypes} // Pass available subtypes for selection.
        uploading={uploading}
        handleFileChange={handleFileChange}
        isEditMode={false} // Indicate this form is for creating new items.
      />
      <div className="text-right">
        {/* Submit button, disabled during upload. */}
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
