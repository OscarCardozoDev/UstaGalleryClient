# Sileo Notifications Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all inline `ErrorMsg`/`SuccessMsg` components and state-based toast patterns in dashboard forms with `sileo` notifications.

**Architecture:** Each file gets `import { sileo } from "sileo"` added, then error/success state vars and their JSX are deleted. `sileo.success()` / `sileo.error()` are called directly in try/catch blocks. Loading state vars that control button `disabled` are kept. For `ReviewArtWorks` and `ReviewEvents` the existing `showToast` helper is rewritten to call sileo instead of setting state, and the toast JSX is removed — the `onToast` prop on `EventCard`/`ArtworkCard` requires no change.

**Tech Stack:** React 19, TypeScript, `sileo` (already installed), no new deps.

---

## File Map

| File | What changes |
|------|-------------|
| `src/pages/dashboard/pages/Clases/Clases.tsx` | Remove `ErrorMsg`/`SuccessMsg` components + 4 state vars; add sileo calls |
| `src/pages/dashboard/pages/CreateEvent/CreateEvent.tsx` | Remove `error`/`success` state + 2 JSX divs; add sileo calls |
| `src/pages/dashboard/pages/EditEvent/EditEvent.tsx` | Remove `error`/`success` state + 2 JSX divs; add sileo calls in all 4 handlers |
| `src/pages/dashboard/pages/UpdatePicture/UpdatePicture.tsx` | Remove `error`/`success` state + 2 JSX divs; add sileo calls |
| `src/pages/dashboard/pages/ReviewArtWorks/ReviewArtWorks.tsx` | Rewrite `showToast` to call sileo; remove `toast` state + toast JSX |
| `src/pages/dashboard/pages/ReviewEvents/ReviewEvents.tsx` | Same as ReviewArtWorks |

---

## Task 1: Clases.tsx

**Files:**
- Modify: `src/pages/dashboard/pages/Clases/Clases.tsx`

- [ ] **Step 1: Add sileo import and remove error/success state**

Replace the top of the file imports (after existing imports) — add:
```tsx
import { sileo } from "sileo";
```

Delete these 4 state declarations (lines ~79-89):
```tsx
const [schedError, setSchedError] = useState<string | null>(null);
const [schedSuccess, setSchedSuccess] = useState<string | null>(null);
// ...
const [classError, setClassError] = useState<string | null>(null);
const [classSuccess, setClassSuccess] = useState<string | null>(null);
```

- [ ] **Step 2: Delete the ErrorMsg and SuccessMsg components**

Delete lines 49-57:
```tsx
function ErrorMsg({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return <p className="mt-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{msg}</p>;
}

function SuccessMsg({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return <p className="mt-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{msg}</p>;
}
```

- [ ] **Step 3: Rewrite handleCreateSchedule**

Replace the entire `handleCreateSchedule` function with:
```tsx
const handleCreateSchedule = async () => {
  if (!currentGroup) return;
  if (!schedStart || !schedEnd) {
    sileo.error({ title: "Completa la hora de inicio y fin." });
    return;
  }
  if (schedStart >= schedEnd) {
    sileo.error({ title: "La hora de fin debe ser mayor a la de inicio." });
    return;
  }
  setSchedLoading(true);
  try {
    await createSchedule({
      groupId: currentGroup,
      dayOfWeek: Number(schedDay),
      startTime: schedStart,
      endTime: schedEnd,
    });
    const [updated, updatedClasses] = await Promise.all([
      getSchedulesByGroup(currentGroup),
      getClassesByGroup(currentGroup),
    ]);
    setSchedules(updated);
    setClasses(updatedClasses);
    sileo.success({ title: "Horario creado", description: "Se generaron las clases del semestre." });
  } catch (e) {
    sileo.error({ title: (e as Error).message });
  } finally {
    setSchedLoading(false);
  }
};
```

- [ ] **Step 4: Rewrite handleDeleteSchedule**

Replace the catch block in `handleDeleteSchedule`:
```tsx
// Old:
} catch (e) {
  alert((e as Error).message);
}

// New:
} catch (e) {
  sileo.error({ title: (e as Error).message });
}
```

- [ ] **Step 5: Rewrite handleCreateClass**

Replace the entire `handleCreateClass` function with:
```tsx
const handleCreateClass = async () => {
  if (!currentGroup) return;
  if (!classDate) { sileo.error({ title: "Selecciona una fecha." }); return; }
  if (!classStart || !classEnd) { sileo.error({ title: "Completa la hora de inicio y fin." }); return; }
  if (classStart >= classEnd) { sileo.error({ title: "La hora de fin debe ser mayor a la de inicio." }); return; }

  const dto: CreateClassDto = {
    groupId: currentGroup,
    date: new Date(classDate).toISOString(),
    startTime: classStart,
    endTime: classEnd,
    ...(classTopic.trim() && { topic: classTopic.trim() }),
  };

  setClassLoading(true);
  try {
    await createManualClass(dto);
    const updatedClasses = await getClassesByGroup(currentGroup);
    setClasses(updatedClasses);
    setClassDate("");
    setClassStart("14:00");
    setClassEnd("16:00");
    setClassTopic("");
    sileo.success({ title: "Clase creada correctamente." });
  } catch (e) {
    sileo.error({ title: (e as Error).message });
  } finally {
    setClassLoading(false);
  }
};
```

- [ ] **Step 6: Remove notification JSX from render**

Delete lines 335-336 (schedule section):
```tsx
<ErrorMsg   msg={schedError}   />
<SuccessMsg msg={schedSuccess} />
```

Delete lines 387-388 (manual class section):
```tsx
<ErrorMsg   msg={classError}   />
<SuccessMsg msg={classSuccess} />
```

- [ ] **Step 7: Commit**

```bash
git add UstaGallery/src/pages/dashboard/pages/Clases/Clases.tsx
git commit -m "feat(dashboard): replace inline notifications with sileo in Clases"
```

---

## Task 2: CreateEvent.tsx

**Files:**
- Modify: `src/pages/dashboard/pages/CreateEvent/CreateEvent.tsx`

- [ ] **Step 1: Add sileo import and remove error/success state**

Add after existing imports:
```tsx
import { sileo } from "sileo";
```

Delete lines 90-91:
```tsx
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState(false);
```

- [ ] **Step 2: Rewrite handleSubmit**

Replace the entire `handleSubmit` function with:
```tsx
const handleSubmit = async () => {
  const validationError = validate();
  if (validationError) { sileo.error({ title: validationError }); return; }

  setIsLoading(true);

  try {
    const toISO = (date: string, time: string) =>
      time ? `${date}T${time}:00.000Z` : `${date}T00:00:00.000Z`;

    const coverItem = imageItems.find((i) => i.isMain) ?? imageItems[0];
    let coverPhoto: CreateEventDto["coverPhoto"] | undefined;

    if (coverItem?.file) {
      const base64 = await fileToBase64(coverItem.file);
      coverPhoto = {
        base64,
        name: coverItem.file.name,
        folder: "events",
        photoType: "HERO",
      };
    }

    const payload: CreateEventDto = {
      name:        form.name.trim(),
      description: form.description.trim(),
      eventType:   form.eventType,
      startDate:   toISO(form.startDate, form.startTime),
      endDate:     form.endDate ? toISO(form.endDate, form.endTime) : undefined,
      locationUrl: !form.isVirtual ? form.locationUrl.trim() : undefined,
      isVirtual:   form.isVirtual,
      streamingUrl: form.isVirtual ? form.streamingUrl.trim() : undefined,
      createdById: user!.uid,
      groupIds:    [currentGroup!],
      productIds:  form.productIds.length > 0 ? form.productIds : undefined,
      coverPhoto,
    };

    await createEvent(payload);
    sileo.success({ title: "¡Evento creado!", description: "Está pendiente de aprobación." });
    setForm(EMPTY_FORM);
    setImageItems([]);
    setUploaderKey((k) => k + 1);
  } catch (err) {
    sileo.error({ title: err instanceof Error ? err.message : "Error al crear el evento." });
  } finally {
    setIsLoading(false);
  }
};
```

- [ ] **Step 3: Remove feedback JSX**

Delete lines 232-233:
```tsx
{error   && <div className={styles.errorMessage}>❌ {error}</div>}
{success && <div className={styles.successMessage}>✅ ¡Evento creado exitosamente! Está pendiente de aprobación.</div>}
```

- [ ] **Step 4: Commit**

```bash
git add UstaGallery/src/pages/dashboard/pages/CreateEvent/CreateEvent.tsx
git commit -m "feat(dashboard): replace inline notifications with sileo in CreateEvent"
```

---

## Task 3: EditEvent.tsx

**Files:**
- Modify: `src/pages/dashboard/pages/EditEvent/EditEvent.tsx`

- [ ] **Step 1: Add sileo import and remove error/success state**

Add after existing imports:
```tsx
import { sileo } from "sileo";
```

Delete lines 103-104:
```tsx
const [error, setError]   = useState<string | null>(null);
const [success, setSuccess] = useState<string | null>(null);
```

- [ ] **Step 2: Rewrite handleSaveInfo**

Replace the entire `handleSaveInfo` function with:
```tsx
const handleSaveInfo = async () => {
  if (!form.name.trim())        { sileo.error({ title: "El nombre es requerido" }); return; }
  if (!form.description.trim()) { sileo.error({ title: "La descripción es requerida" }); return; }
  if (!form.startDate)          { sileo.error({ title: "La fecha de inicio es requerida" }); return; }
  if (form.isVirtual && !form.streamingUrl.trim())
    { sileo.error({ title: "El link de streaming es requerido para eventos virtuales" }); return; }

  setIsLoadingInfo(true);
  try {
    await updateEvent(uid!, {
      name:        form.name.trim(),
      description: form.description.trim(),
      eventType:   form.eventType,
      startDate:   combineDatetime(form.startDate, form.startTime),
      endDate:     form.endDate ? combineDatetime(form.endDate, form.endTime) : undefined,
      locationUrl: form.locationUrl.trim() || undefined,
      isVirtual:   form.isVirtual,
      streamingUrl: form.isVirtual ? form.streamingUrl.trim() : undefined,
    });
    sileo.success({
      title: "Información actualizada",
      description: "El evento volvió a estado PENDIENTE para revisión del admin.",
    });
  } catch (err) {
    sileo.error({ title: err instanceof Error ? err.message : "Error al guardar" });
  } finally {
    setIsLoadingInfo(false);
  }
};
```

- [ ] **Step 3: Rewrite handleUploadPhotos**

Replace the entire `handleUploadPhotos` function with:
```tsx
const handleUploadPhotos = async () => {
  const newItems = newPhotoItems.filter((i) => !i.isExisting && i.file);
  if (newItems.length === 0) { sileo.error({ title: "Selecciona al menos una foto para subir" }); return; }

  setIsLoadingPhotos(true);
  try {
    for (const item of newItems) {
      const base64 = await convertFileToBase64(item.file!);
      await addEventPhoto(uid!, {
        base64,
        name: item.file!.name,
        folder: "events",
        photoType: selectedPhotoType,
      });
    }
    const updated = await getEventById(uid!);
    setEvent(updated);
    setNewPhotoItems([]);
    setUploaderKey((k) => k + 1);
    sileo.success({ title: `${newItems.length} foto(s) subidas correctamente.` });
  } catch (err) {
    sileo.error({ title: err instanceof Error ? err.message : "Error al subir fotos" });
  } finally {
    setIsLoadingPhotos(false);
  }
};
```

- [ ] **Step 4: Rewrite handleDeletePhoto**

Replace the entire `handleDeletePhoto` function with:
```tsx
const handleDeletePhoto = async (photoId: string) => {
  try {
    await removeEventPhoto(uid!, photoId);
    setEvent((prev) =>
      prev
        ? { ...prev, photos: prev.photos.filter((p) => p.photo.uid !== photoId) }
        : prev
    );
  } catch (err) {
    sileo.error({ title: err instanceof Error ? err.message : "Error al eliminar foto" });
  }
};
```

- [ ] **Step 5: Rewrite handleSaveProducts**

Replace the entire `handleSaveProducts` function with:
```tsx
const handleSaveProducts = async () => {
  if (!requestingGroupId) { sileo.error({ title: "No hay grupo seleccionado" }); return; }

  setIsLoadingProducts(true);
  try {
    await updateEventProducts(uid!, {
      productIds: selectedProducts,
      groupId: requestingGroupId,
    });
    sileo.success({ title: "Obras actualizadas", description: "El evento volvió a PENDIENTE para revisión." });
  } catch (err) {
    sileo.error({ title: err instanceof Error ? err.message : "Error al actualizar obras" });
  } finally {
    setIsLoadingProducts(false);
  }
};
```

- [ ] **Step 6: Clean up tab onChange and remove feedback JSX**

In the tabs `onClick` handler (line ~319), remove `setError(null); setSuccess(null);`:
```tsx
// Old:
onClick={() => { setActiveTab(tab); setError(null); setSuccess(null); }}

// New:
onClick={() => setActiveTab(tab)}
```

Delete lines 309-310:
```tsx
{error   && <div className={styles.errorMessage}>❌ {error}</div>}
{success && <div className={styles.successMessage}>{success}</div>}
```

- [ ] **Step 7: Commit**

```bash
git add UstaGallery/src/pages/dashboard/pages/EditEvent/EditEvent.tsx
git commit -m "feat(dashboard): replace inline notifications with sileo in EditEvent"
```

---

## Task 4: UpdatePicture.tsx

**Files:**
- Modify: `src/pages/dashboard/pages/UpdatePicture/UpdatePicture.tsx`

- [ ] **Step 1: Add sileo import and remove error/success state**

Add after existing imports:
```tsx
import { sileo } from "sileo";
```

Delete lines 30-31:
```tsx
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState(false);
```

- [ ] **Step 2: Replace all setError/setSuccess calls in the submit handler**

Find the submit handler (calls `updateProduct` or similar). Replace:
```tsx
// These patterns:
setError(null);
setSuccess(false);
setError(validationError);           // → sileo.error({ title: validationError }); return;
setError("No se pudo cargar ...");   // → sileo.error({ title: "No se pudo cargar ..." })
setSuccess(true);                    // → sileo.success({ title: "¡Obra actualizada exitosamente!" })
setTimeout(() => setSuccess(false), ...); // → delete entirely
setError(err instanceof Error ? err.message : "Error al actualizar la obra");
// → sileo.error({ title: err instanceof Error ? err.message : "Error al actualizar la obra" })
```

Full rewrite of submit handler (validation + async block):
```tsx
const handleSubmit = async () => {
  // Validation
  const validationError = validate(); // keep existing validate() call
  if (validationError) { sileo.error({ title: validationError }); return; }

  setIsLoading(true);
  try {
    // ... existing payload construction unchanged ...
    await updateProduct(uid!, payload); // keep existing service call
    sileo.success({ title: "¡Obra actualizada exitosamente!" });
  } catch (err) {
    sileo.error({ title: err instanceof Error ? err.message : "Error al actualizar la obra" });
  } finally {
    setIsLoading(false);
  }
};
```

- [ ] **Step 3: Remove feedback JSX**

Delete lines 232-235:
```tsx
{error && <div className={styles.errorMessage}>❌ {error}</div>}
{success && (
  <div className={styles.successMessage}>✅ ¡Obra actualizada exitosamente!</div>
)}
```

- [ ] **Step 4: Commit**

```bash
git add UstaGallery/src/pages/dashboard/pages/UpdatePicture/UpdatePicture.tsx
git commit -m "feat(dashboard): replace inline notifications with sileo in UpdatePicture"
```

---

## Task 5: ReviewArtWorks.tsx + ReviewEvents.tsx

**Files:**
- Modify: `src/pages/dashboard/pages/ReviewArtWorks/ReviewArtWorks.tsx`
- Modify: `src/pages/dashboard/pages/ReviewEvents/ReviewEvents.tsx`

These two pages pass an `onToast(message, type)` callback to `ArtworkCard`/`EventCard`. They also maintain their own `toast` state for an inline toast element. The fix: delete the `toast` state + toast JSX and rewrite `showToast` to call sileo directly. `EventCard`/`ArtworkCard` need **no changes** since they still call `onToast(msg, type)` — the parent just now backs it with sileo.

- [ ] **Step 1: ReviewArtWorks — add import, remove toast state**

Add after existing imports:
```tsx
import { sileo } from "sileo";
```

Delete line 31:
```tsx
const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
```

- [ ] **Step 2: ReviewArtWorks — rewrite showToast**

Replace (lines ~80-84):
```tsx
// Old:
const showToast = (message: string, type: "success" | "error") => {
  setToast({ message, type });
  setTimeout(() => setToast(null), 3500);
};

// New:
const showToast = (message: string, type: "success" | "error") => {
  if (type === "success") sileo.success({ title: message });
  else sileo.error({ title: message });
};
```

- [ ] **Step 3: ReviewArtWorks — remove toast JSX**

Find and delete the toast render block (looks like):
```tsx
{toast && (
  <div className={...}>
    {toast.message}
  </div>
)}
```

- [ ] **Step 4: ReviewEvents — add import, remove toast state**

Add after existing imports:
```tsx
import { sileo } from "sileo";
```

Delete line 30:
```tsx
const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
```

- [ ] **Step 5: ReviewEvents — rewrite showToast**

Replace (lines ~70-73):
```tsx
// Old:
const showToast = (message: string, type: "success" | "error") => {
  setToast({ message, type });
  setTimeout(() => setToast(null), 3500);
};

// New:
const showToast = (message: string, type: "success" | "error") => {
  if (type === "success") sileo.success({ title: message });
  else sileo.error({ title: message });
};
```

- [ ] **Step 6: ReviewEvents — remove toast JSX**

Find and delete the toast render block in ReviewEvents.tsx.

- [ ] **Step 7: Commit**

```bash
git add UstaGallery/src/pages/dashboard/pages/ReviewArtWorks/ReviewArtWorks.tsx
git add UstaGallery/src/pages/dashboard/pages/ReviewEvents/ReviewEvents.tsx
git commit -m "feat(dashboard): replace inline toast with sileo in ReviewArtWorks and ReviewEvents"
```

---

## Verification

After all tasks:
- [ ] Run `cd UstaGallery && bun run build` — must complete with no TypeScript errors
- [ ] Open dashboard in browser, submit each form (create schedule, create class, create event, edit event, update artwork, approve/reject artwork, approve/reject event) and verify sileo notifications appear instead of inline banners
- [ ] Verify no `useState` calls remain for `error`/`success`/`toast` in the 6 modified files:
  ```bash
  grep -n "setError\|setSuccess\|setToast" UstaGallery/src/pages/dashboard/pages/Clases/Clases.tsx UstaGallery/src/pages/dashboard/pages/CreateEvent/CreateEvent.tsx UstaGallery/src/pages/dashboard/pages/EditEvent/EditEvent.tsx UstaGallery/src/pages/dashboard/pages/UpdatePicture/UpdatePicture.tsx UstaGallery/src/pages/dashboard/pages/ReviewArtWorks/ReviewArtWorks.tsx UstaGallery/src/pages/dashboard/pages/ReviewEvents/ReviewEvents.tsx
  ```
  Expected: no output
