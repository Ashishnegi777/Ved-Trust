import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ImagePlus,
  LoaderCircle,
  LogIn,
  LogOut,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import { getGalleryImageUrl, toGalleryItem, type GalleryItem } from '../lib/gallery';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const maxImageBytes = 10 * 1024 * 1024;
const maxImageDimension = 8000;
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

function getErrorMessage(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error && 'message' in error && typeof error.message === 'string'
        ? error.message
        : 'Something went wrong. Please try again.';

  if (message.toLowerCase().includes('row-level security') || message.toLowerCase().includes('permission denied')) {
    return 'This account is signed in but is not listed as a gallery owner yet. Add its user UUID to public.gallery_admins in Supabase.';
  }

  if (message.toLowerCase().includes('exp claim timestamp check failed')) {
    return 'Your gallery sign-in has expired. Sign out, make sure Windows date and time are set automatically, then sign in again.';
  }

  return message;
}

async function validateImageFile(file: File) {
  if (!allowedImageTypes.has(file.type)) {
    return 'Use a JPG, PNG, or WebP image.';
  }

  if (file.size > maxImageBytes) {
    return 'Images must be 10 MB or smaller.';
  }

  try {
    const bitmap = await createImageBitmap(file);
    const isTooLarge = bitmap.width > maxImageDimension || bitmap.height > maxImageDimension;
    bitmap.close();

    return isTooLarge ? 'Images cannot exceed 8000 pixels on either side.' : null;
  } catch {
    return 'The selected file is not a readable image.';
  }
}

function GalleryItemEditor({
  item,
  onSave,
  onPublishToggle,
  onMove,
  onDelete,
  isSaving,
  canMoveUp,
  canMoveDown,
}: {
  item: GalleryItem;
  onSave: (item: GalleryItem, title: string, location: string) => Promise<void>;
  onPublishToggle: (item: GalleryItem) => Promise<void>;
  onMove: (item: GalleryItem, direction: -1 | 1) => Promise<void>;
  onDelete: (item: GalleryItem) => Promise<void>;
  isSaving: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const [title, setTitle] = useState(item.title);
  const [location, setLocation] = useState(item.location ?? '');

  useEffect(() => {
    setTitle(item.title);
    setLocation(item.location ?? '');
  }, [item.id, item.location, item.title]);

  const hasChanges = title.trim() !== item.title || location.trim() !== (item.location ?? '');

  return (
    <article className="grid grid-cols-1 gap-5 border-b border-earth/15 py-7 md:grid-cols-[180px_minmax(0,1fr)_auto] md:items-start">
      <div className="aspect-[4/3] overflow-hidden rounded-[6px] bg-earth/10">
        <img
          src={getGalleryImageUrl(item.imagePath)}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>

      <div className="grid gap-4">
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Caption
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-11 rounded-[5px] border border-earth/20 bg-white/55 px-3 text-sm normal-case tracking-normal text-text-charcoal outline-none transition-colors focus:border-pine-green"
            maxLength={140}
          />
        </label>

        <label className="grid gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
          Location or category
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="h-11 rounded-[5px] border border-earth/20 bg-white/55 px-3 text-sm normal-case tracking-normal text-text-charcoal outline-none transition-colors focus:border-pine-green"
            maxLength={120}
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onSave(item, title.trim(), location.trim())}
            disabled={!hasChanges || isSaving || !title.trim()}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-pine-green px-4 text-xs font-semibold text-background-warm transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save size={15} />
            Save details
          </button>
          <span className={`text-xs font-medium ${item.isPublished ? 'text-pine-green' : 'text-text-muted'}`}>
            {item.isPublished ? 'Visible on the website' : 'Draft only'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:flex-col">
        <button
          type="button"
          onClick={() => onMove(item, -1)}
          disabled={!canMoveUp || isSaving}
          aria-label="Move image earlier"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-earth/25 text-text-charcoal transition-colors hover:border-pine-green hover:text-pine-green disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ArrowUp size={17} />
        </button>
        <button
          type="button"
          onClick={() => onMove(item, 1)}
          disabled={!canMoveDown || isSaving}
          aria-label="Move image later"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-earth/25 text-text-charcoal transition-colors hover:border-pine-green hover:text-pine-green disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ArrowDown size={17} />
        </button>
        <button
          type="button"
          onClick={() => onPublishToggle(item)}
          disabled={isSaving}
          aria-label={item.isPublished ? 'Hide image from website' : 'Publish image'}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-earth/25 text-text-charcoal transition-colors hover:border-pine-green hover:text-pine-green disabled:cursor-not-allowed disabled:opacity-35"
        >
          {item.isPublished ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
        <button
          type="button"
          onClick={() => onDelete(item)}
          disabled={isSaving}
          aria-label="Delete image"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-earth/25 text-text-charcoal transition-colors hover:border-red-700 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </article>
  );
}

export default function AdminGallery() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadItems = async () => {
    if (!supabase) return;

    const { data, error } = await supabase
      .from('gallery_items')
      .select('id, image_path, title, location, sort_order, is_published, created_at')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    setItems((data ?? []).map(toGalleryItem));
  };

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let mounted = true;
    const initialize = async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setSession(data.session);
        setIsLoading(false);
      }
    };

    initialize();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    loadItems()
      .catch((error) => setMessage(getErrorMessage(error)))
      .finally(() => setIsLoading(false));
  }, [session]);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;

    setIsSaving(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsSaving(false);
    if (error) setMessage(error.message);
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setMessage('');
  };

  const uploadImage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !file) return;

    const fileValidationError = await validateImageFile(file);
    if (fileValidationError) {
      setMessage(fileValidationError);
      return;
    }

    if (!title.trim()) {
      setMessage('Add a caption before uploading.');
      return;
    }

    setIsSaving(true);
    setMessage('');

    // Renew the browser session before Storage validates the JWT for this upload.
    const { data: refreshedSession, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError || !refreshedSession.session) {
      setIsSaving(false);
      setMessage(getErrorMessage(refreshError ?? new Error('Your gallery sign-in has expired. Please sign in again.')));
      return;
    }
    setSession(refreshedSession.session);

    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const imagePath = `${crypto.randomUUID()}.${extension}`;
    const nextSortOrder = Math.max(-1, ...items.map((item) => item.sortOrder)) + 1;

    const { error: uploadError } = await supabase.storage.from('gallery').upload(imagePath, file, {
      cacheControl: '31536000',
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) {
      setIsSaving(false);
      setMessage(uploadError.message);
      return;
    }

    const { error: insertError } = await supabase.from('gallery_items').insert({
      image_path: imagePath,
      title: title.trim(),
      location: location.trim() || null,
      sort_order: nextSortOrder,
      is_published: true,
    });

    if (insertError) {
      await supabase.storage.from('gallery').remove([imagePath]);
      setIsSaving(false);
      setMessage(insertError.message);
      return;
    }

    setTitle('');
    setLocation('');
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    await loadItems();
    setIsSaving(false);
    setMessage('Image uploaded and published.');
  };

  const saveItem = async (item: GalleryItem, nextTitle: string, nextLocation: string) => {
    if (!supabase || !nextTitle) return;
    setIsSaving(true);
    setMessage('');

    const { error } = await supabase
      .from('gallery_items')
      .update({ title: nextTitle, location: nextLocation || null, updated_at: new Date().toISOString() })
      .eq('id', item.id);

    if (error) setMessage(error.message);
    else await loadItems();
    setIsSaving(false);
  };

  const togglePublished = async (item: GalleryItem) => {
    if (!supabase) return;
    setIsSaving(true);
    setMessage('');
    const { error } = await supabase
      .from('gallery_items')
      .update({ is_published: !item.isPublished, updated_at: new Date().toISOString() })
      .eq('id', item.id);

    if (error) setMessage(error.message);
    else await loadItems();
    setIsSaving(false);
  };

  const moveItem = async (item: GalleryItem, direction: -1 | 1) => {
    if (!supabase) return;
    const index = items.findIndex((candidate) => candidate.id === item.id);
    const adjacent = items[index + direction];
    if (!adjacent) return;

    setIsSaving(true);
    setMessage('');
    const [{ error: firstError }, { error: secondError }] = await Promise.all([
      supabase.from('gallery_items').update({ sort_order: adjacent.sortOrder }).eq('id', item.id),
      supabase.from('gallery_items').update({ sort_order: item.sortOrder }).eq('id', adjacent.id),
    ]);

    if (firstError || secondError) setMessage(firstError?.message ?? secondError?.message ?? 'Could not reorder images.');
    else await loadItems();
    setIsSaving(false);
  };

  const deleteItem = async (item: GalleryItem) => {
    if (!supabase || !window.confirm(`Delete “${item.title}” permanently?`)) return;
    setIsSaving(true);
    setMessage('');

    const { error: deleteRowError } = await supabase.from('gallery_items').delete().eq('id', item.id);
    if (deleteRowError) {
      setIsSaving(false);
      setMessage(deleteRowError.message);
      return;
    }

    const { error: deleteFileError } = await supabase.storage.from('gallery').remove([item.imagePath]);
    if (deleteFileError) setMessage(`Gallery entry removed, but the file could not be removed: ${deleteFileError.message}`);
    else await loadItems();
    setIsSaving(false);
  };

  if (!isSupabaseConfigured || !supabase) {
    return (
      <main className="min-h-screen bg-background-warm px-6 py-24 text-text-charcoal md:px-12 md:py-32">
        <div className="mx-auto max-w-2xl">
          <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-pine-green">
            <ArrowLeft size={16} /> Back to website
          </a>
          <h1 className="mt-10 font-heading text-5xl tracking-tight text-pine-green md:text-6xl">Gallery setup needed</h1>
          <p className="mt-5 font-body leading-relaxed text-text-muted">
            Add your Supabase URL and anon key to <code>.env.local</code>, then run the provided SQL setup file.
          </p>
        </div>
      </main>
    );
  }

  if (isLoading && !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background-warm text-pine-green">
        <LoaderCircle className="animate-spin" aria-label="Loading gallery dashboard" />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-background-warm px-6 py-24 text-text-charcoal md:px-12 md:py-32">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-pine-green">
              <ArrowLeft size={16} /> Back to website
            </a>
            <p className="mt-16 font-mono text-xs font-semibold uppercase tracking-widest text-earth">Ved Trust owner access</p>
            <h1 className="mt-5 font-heading text-5xl leading-[1.02] tracking-tight text-pine-green md:text-7xl">
              Keep the gallery alive.
            </h1>
            <p className="mt-6 max-w-xl font-body text-base font-light leading-relaxed text-text-muted md:text-lg">
              Upload moments from the work, decide what is public, and keep the visual record in the order that tells the story best.
            </p>
          </div>

          <form onSubmit={signIn} className="border border-earth/20 bg-white/45 p-7 shadow-sm md:p-8">
            <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-full bg-pine-green text-background-warm">
              <LogIn size={21} />
            </div>
            <h2 className="font-heading text-3xl text-text-charcoal">Owner sign in</h2>
            <label className="mt-6 grid gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 rounded-[5px] border border-earth/20 bg-background-warm px-3 text-sm normal-case tracking-normal text-text-charcoal outline-none focus:border-pine-green"
                required
              />
            </label>
            <label className="mt-4 grid gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 rounded-[5px] border border-earth/20 bg-background-warm px-3 text-sm normal-case tracking-normal text-text-charcoal outline-none focus:border-pine-green"
                required
              />
            </label>
            {message && <p className="mt-4 text-sm text-red-700">{message}</p>}
            <button
              type="submit"
              disabled={isSaving}
              className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-pine-green px-5 text-sm font-semibold text-background-warm disabled:opacity-55"
            >
              {isSaving ? <LoaderCircle size={17} className="animate-spin" /> : <LogIn size={17} />}
              Sign in
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background-warm px-6 py-12 text-text-charcoal md:px-12 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-earth/20 pb-8">
          <div>
            <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-pine-green">
              <ArrowLeft size={16} /> Back to website
            </a>
            <p className="mt-8 font-mono text-xs font-semibold uppercase tracking-widest text-earth">Owner dashboard</p>
            <h1 className="mt-3 font-heading text-5xl tracking-tight text-pine-green md:text-6xl">Gallery manager</h1>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-earth/25 px-4 text-sm font-semibold text-text-charcoal transition-colors hover:border-pine-green hover:text-pine-green"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>

        <section className="grid gap-8 py-10 lg:grid-cols-[360px_minmax(0,1fr)]">
          <form onSubmit={uploadImage} className="h-fit border border-earth/20 bg-white/45 p-6 md:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pine-green text-background-warm">
              <ImagePlus size={21} />
            </div>
            <h2 className="mt-6 font-heading text-3xl text-text-charcoal">Add an image</h2>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">JPG, PNG, or WebP up to 10 MB.</p>

            <label className="mt-6 grid gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Image file
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="block w-full text-sm normal-case tracking-normal text-text-muted file:mr-3 file:rounded-full file:border-0 file:bg-pine-green file:px-4 file:py-2 file:text-xs file:font-semibold file:text-background-warm"
                required
              />
            </label>
            <label className="mt-5 grid gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Caption
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={140}
                className="h-11 rounded-[5px] border border-earth/20 bg-background-warm px-3 text-sm normal-case tracking-normal text-text-charcoal outline-none focus:border-pine-green"
                required
              />
            </label>
            <label className="mt-5 grid gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Location or category
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                maxLength={120}
                className="h-11 rounded-[5px] border border-earth/20 bg-background-warm px-3 text-sm normal-case tracking-normal text-text-charcoal outline-none focus:border-pine-green"
              />
            </label>
            <button
              type="submit"
              disabled={isSaving}
              className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-pine-green px-5 text-sm font-semibold text-background-warm disabled:opacity-55"
            >
              {isSaving ? <LoaderCircle size={17} className="animate-spin" /> : <Upload size={17} />}
              Upload and publish
            </button>
          </form>

          <section>
            <div className="flex items-end justify-between border-b border-earth/15 pb-4">
              <div>
                <h2 className="font-heading text-3xl text-text-charcoal">Current gallery</h2>
                <p className="mt-1 text-sm text-text-muted">Use arrows to control the display order.</p>
              </div>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-earth">{items.length} items</span>
            </div>

            {message && <p className="mt-5 text-sm text-text-muted">{message}</p>}
            {isLoading ? (
              <div className="flex min-h-48 items-center justify-center text-pine-green"><LoaderCircle className="animate-spin" /></div>
            ) : items.length === 0 ? (
              <div className="py-12 text-sm text-text-muted">No gallery images yet. Your uploads will appear here.</div>
            ) : (
              <div>
                {items.map((item, index) => (
                  <div key={item.id}>
                    <GalleryItemEditor
                      item={item}
                      onSave={saveItem}
                      onPublishToggle={togglePublished}
                      onMove={moveItem}
                      onDelete={deleteItem}
                      isSaving={isSaving}
                      canMoveUp={index > 0}
                      canMoveDown={index < items.length - 1}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
