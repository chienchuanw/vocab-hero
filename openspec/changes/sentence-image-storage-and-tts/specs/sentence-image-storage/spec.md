## ADDED Requirements

### Requirement: Image upload API accepts Duolingo screenshots
The system SHALL provide a `POST /api/sentences/upload` endpoint that accepts image files via `multipart/form-data` and stores them to the local filesystem at `public/uploads/sentences/`.

#### Scenario: Successful image upload
- **WHEN** a valid image file (JPEG, PNG, or WebP) is sent to `POST /api/sentences/upload`
- **THEN** the system SHALL save the file to `public/uploads/sentences/{cuid}.{ext}` and return `{ success: true, data: { imageUrl: "/uploads/sentences/{cuid}.{ext}" } }` with status 201

#### Scenario: Upload with invalid file type
- **WHEN** a non-image file (e.g., PDF, TXT) is sent to `POST /api/sentences/upload`
- **THEN** the system SHALL return a validation error with status 400 and message indicating invalid file type

#### Scenario: Upload with no file
- **WHEN** a request is sent to `POST /api/sentences/upload` without a file
- **THEN** the system SHALL return a validation error with status 400

#### Scenario: Upload with oversized file
- **WHEN** an image file exceeding 10MB is sent to `POST /api/sentences/upload`
- **THEN** the system SHALL return a validation error with status 400 and message indicating file too large

### Requirement: Image deletion API removes uploaded files
The system SHALL provide a `DELETE /api/sentences/upload` endpoint that removes a previously uploaded image file from the filesystem.

#### Scenario: Successful image deletion
- **WHEN** a valid `imageUrl` is sent to `DELETE /api/sentences/upload` with body `{ imageUrl: "/uploads/sentences/{filename}" }`
- **THEN** the system SHALL delete the file from disk and return `{ success: true }` with status 200

#### Scenario: Deletion of non-existent file
- **WHEN** an `imageUrl` pointing to a non-existent file is sent to `DELETE /api/sentences/upload`
- **THEN** the system SHALL return `{ success: true }` with status 200 (idempotent)

### Requirement: SentenceCard model includes imageUrl field
The `SentenceCard` database model SHALL include a nullable `imageUrl` field (`image_url` column) to store the path of the associated Duolingo screenshot.

#### Scenario: Creating a sentence with image
- **WHEN** a sentence is created via `POST /api/sentences` with `{ japanese, english, imageUrl: "/uploads/sentences/abc.png" }`
- **THEN** the system SHALL store the sentence with the `imageUrl` field populated

#### Scenario: Creating a sentence without image
- **WHEN** a sentence is created via `POST /api/sentences` with `{ japanese, english }` (no `imageUrl`)
- **THEN** the system SHALL store the sentence with `imageUrl` as `null`

#### Scenario: Fetching sentences includes imageUrl
- **WHEN** sentences are fetched via `GET /api/sentences`
- **THEN** each sentence in the response SHALL include the `imageUrl` field (string or null)

### Requirement: OCR import flow uploads images to server
During the image import flow, the system SHALL upload each Duolingo screenshot to the server before or during OCR processing, replacing the temporary object URL with the server-persisted URL.

#### Scenario: Images uploaded during OCR processing
- **WHEN** the user selects image files for import
- **THEN** the system SHALL upload each image to `POST /api/sentences/upload` and use the returned `imageUrl` in the OCR preview items

#### Scenario: Saving OCR result includes image URL
- **WHEN** the user saves an OCR preview item
- **THEN** the system SHALL include the server `imageUrl` in the `POST /api/sentences` request body

#### Scenario: Saving all OCR results includes image URLs
- **WHEN** the user clicks "Save All" on OCR preview
- **THEN** the system SHALL include each item's server `imageUrl` in the respective `POST /api/sentences` requests

#### Scenario: Discarding OCR result cleans up uploaded image
- **WHEN** the user discards an OCR preview item that has a server `imageUrl`
- **THEN** the system SHALL call `DELETE /api/sentences/upload` to remove the uploaded file

#### Scenario: Closing import dialog cleans up all uploaded images
- **WHEN** the user closes the import dialog with unsaved OCR items that have server `imageUrl`s
- **THEN** the system SHALL call `DELETE /api/sentences/upload` for each unsaved item's image

### Requirement: Sentence list cards display source image thumbnail
The sentence list card component SHALL display the Duolingo source image as a thumbnail when the sentence has an associated `imageUrl`.

#### Scenario: Card with image shows thumbnail
- **WHEN** a sentence card with a non-null `imageUrl` is rendered in the sentence list
- **THEN** the card SHALL display the image as a thumbnail (max height 120px, object-contain) in the card content area

#### Scenario: Card without image shows no thumbnail
- **WHEN** a sentence card with a null `imageUrl` is rendered in the sentence list
- **THEN** the card SHALL NOT display any image placeholder or thumbnail area
