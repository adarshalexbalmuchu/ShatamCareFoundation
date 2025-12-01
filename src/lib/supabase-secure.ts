import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with environment variables
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Hard fallback: if wrong project ref (old) or missing anon key, override with known good values
const CANONICAL_URL = 'https://uumavtvxuncetfqwlgvp.supabase.co';
const CANONICAL_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1bWF2dHZ4dW5jZXRmcXdsZ3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjM2NTQsImV4cCI6MjA2NzI5OTY1NH0.AAoykuZmtZ3gLtbAXLjlYkyqaVUsghx84CP9nF1xkHU';
const OLD_REF_REGEX = /zkvzctonbjqfxbpwnuvh/;
if (!supabaseUrl || OLD_REF_REGEX.test(supabaseUrl)) {
  supabaseUrl = CANONICAL_URL;
}
if (!supabaseAnonKey) {
  supabaseAnonKey = CANONICAL_ANON;
}

// Detect placeholder / invalid values early to provide clearer UX
const isPlaceholderUrl = /<NEW_PROJECT_REF>/i.test(supabaseUrl);
const isPlaceholderKey = /<NEW_ANON_KEY>/i.test(supabaseAnonKey);
const isJwtLike = supabaseAnonKey.startsWith('ey'); // Supabase anon keys are JWT-like
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey && !isPlaceholderUrl && !isPlaceholderKey && isJwtLike;

if (!isSupabaseConfigured) {
  // Give a single consolidated warning with actionable steps
  console.error('[Supabase Config] Invalid or missing configuration detected.\n' +
    `VITE_SUPABASE_URL: ${supabaseUrl || 'MISSING'}\n` +
    `VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? (isPlaceholderKey ? 'PLACEHOLDER' : (isJwtLike ? 'PRESENT' : 'INVALID_FORMAT')) : 'MISSING'}\n` +
    'Update your .env (or deployment environment) with correct values from Supabase Dashboard → Settings → API (use the Project URL and anon public key).');
}

export const supabase = createClient(
  supabaseUrl || 'https://dummy.supabase.co', 
  supabaseAnonKey || 'dummy-key', 
  {
    auth: {
      storage: window.localStorage,
      storageKey: 'shatam-care-auth',
      persistSession: true,
      detectSessionInUrl: true,
      autoRefreshToken: true
    }
  }
);

// Type definitions for database entities
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  spots_available: number;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EventForDisplay extends Event {
  type?: string;
  image?: string;
  spots?: string;
}

export interface EventRegistration {
  event_id: string;
  name: string;
  email: string;
  phone: string;
  emergency_contact?: string;
  medical_conditions?: string;
  dietary_requirements?: string;
  experience?: string;
  motivation?: string;
  status?: string;
  created_at?: string;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  details: string;
  image_url?: string;
  icon: string;
  cta_text: string;
  impact_text: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProgramForDisplay extends Program {
  image?: string;
}

// Admin-specific interfaces
export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    facebook: string;
    linkedin: string;
    instagram: string;
  };
  emailSettings: {
    fromName: string;
    fromEmail: string;
    replyTo: string;
  };
  features: {
    enableNewsletterSignup: boolean;
    enableEventRegistration: boolean;
    enableContactForm: boolean;
    enableDonations: boolean;
  };
}

export interface ContentItem {
  id: string;
  title: string;
  content: string;
  type: 'page' | 'section' | 'component';
  page: string;
  section?: string;
  status: 'published' | 'draft';
  meta_description?: string;
  meta_keywords?: string;
  created_at: string;
  updated_at: string;
}

export interface MediaFile {
  id: string;
  name: string;
  original_name: string;
  url: string;
  type: 'image' | 'document' | 'video' | 'other';
  mime_type: string;
  size: number;
  category?: string;
  alt_text?: string;
  description?: string;
  uploaded_by?: string;
  uploaded_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  role: 'super_admin' | 'admin' | 'editor';
  is_active: boolean;
  last_login?: string;
  permissions: Record<string, boolean>;
  created_at: string;
}

export interface AdminActivity {
  id: string;
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Function to register for an event (works for anonymous users)
export async function registerForEvent(formData: EventRegistration) {
  try {
    console.log('Submitting registration with secure setup:', formData);
    
    const { data, error } = await supabase
      .from('event_registrations')
      .insert([{
        ...formData,
        status: 'confirmed',
        created_at: new Date().toISOString()
      }]);
    
    if (error) {
      console.error('Error registering for event:', error);
      if (error.code === '23505') {
        throw new Error('You have already registered for this event.');
      } else if (error.code === '23503') {
        throw new Error('This event is no longer available.');
      } else {
        throw new Error(`Database error: ${error.message}`);
      }
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

// Function to view events (works for anonymous users)
export async function getEvents(): Promise<EventForDisplay[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Map event types based on event titles for display
    const eventTypeMap: Record<string, string> = {
      'Caregiver Training Workshop': 'Workshop',
      'Memory Café Meetup': 'Support Group',
      'Therapy Session': 'Therapy',
      'Fundraiser Event': 'Fundraiser'
    };
    
    // Format the events for frontend display with optimized processing
    return data.map(event => {
      // Optimized time formatting
      const [hour, minute] = event.time.substring(0, 5).split(':').map(Number);
      const formattedTime = hour > 12 
        ? `${hour - 12}:${minute.toString().padStart(2, '0')} PM`
        : `${hour}:${minute.toString().padStart(2, '0')} ${hour === 12 ? 'PM' : 'AM'}`;
      
      return {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: formattedTime,
        location: event.location,
        capacity: event.capacity,
        spots_available: event.spots_available,
        image_url: event.image_url,
        created_at: event.created_at,
        updated_at: event.updated_at,
        // UI specific properties
        type: eventTypeMap[event.title] || 'Event',
        spots: `${event.spots_available} ${event.spots_available === 1 ? 'spot' : 'spots'} left`
      };
    });
  } catch (err) {
    console.error('Failed to fetch events:', err);
    return [];
  }
}

// Function to get a single event by ID
export async function getEventById(eventId: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();
  
  if (error) {
    console.error('Error fetching event:', error);
    return null;
  }
  
  return data;
}

// Helper for handling Supabase errors
export const handleSupabaseError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
  }
  return 'An unexpected error occurred. Please try again.';
};

// Program Management Functions

// Function to get all active programs (works for anonymous users)
export async function getPrograms(): Promise<ProgramForDisplay[]> {
  try {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching programs:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Format the programs for frontend display
    return data.map(program => ({
      ...program,
      // Add image property for compatibility with existing frontend
      image: program.image_url
    }));
  } catch (err) {
    console.error('Failed to fetch programs:', err);
    return [];
  }
}

// Function to get all programs (including inactive) for admin
export async function getAllPrograms(): Promise<Program[]> {
  try {
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching all programs:', error);
      return [];
    }
    
    return data || [];
  } catch (err) {
    console.error('Failed to fetch all programs:', err);
    return [];
  }
}

// Function to create a new program (admin only)
export async function createProgram(programData: Omit<Program, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('programs')
      .insert([programData])
      .select();
    
    if (error) {
      console.error('Error creating program:', error);
      throw new Error(`Failed to create program: ${error.message}`);
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Program creation failed:', error);
    throw error;
  }
}

// Function to update a program (admin only)
export async function updateProgram(programId: string, updates: Partial<Program>) {
  try {
    console.log('Attempting to update program:', { programId, updates });
    
    const { data, error } = await supabase
      .from('programs')
      .update(updates)
      .eq('id', programId)
      .select();
    
    if (error) {
      console.error('Error updating program:', error);
      throw new Error(`Failed to update program: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      console.warn('No data returned from update. Program may not exist.');
      throw new Error('Program update failed - no data returned');
    }
    
    console.log('Program updated successfully:', data[0]);
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('Program update failed:', error);
    throw error;
  }
}

// Function to delete a program (admin only)
export async function deleteProgram(programId: string) {
  try {
    console.log('Attempting to delete program with ID:', programId);
    
    const { data, error } = await supabase
      .from('programs')
      .delete()
      .eq('id', programId)
      .select();
    
    if (error) {
      console.error('Error deleting program:', error);
      throw new Error(`Failed to delete program: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      console.warn('No data returned from delete. Program may not exist.');
      throw new Error('Program deletion failed - program may not exist');
    }
    
    console.log('Program deleted successfully:', data[0]);
    return { success: true, data };
  } catch (error) {
    console.error('Program deletion failed:', error);
    throw error;
  }
}

// =================
// ADMIN FUNCTIONS
// =================

// Site Settings Management
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value');
    
    if (error) throw error;
    
    // Convert array of key-value pairs to settings object
    const settingsMap: Record<string, unknown> = {};
    data?.forEach((item) => {
      settingsMap[item.key] = item.value;
    });
    
    return {
      siteName: (settingsMap.site_name as string) || 'Shatam Care Foundation',
      siteDescription: (settingsMap.site_description as string) || 'Caring for Our Elderly with Compassion and Dignity',
      contactEmail: (settingsMap.contact_email as string) || 'shatamcare@gmail.com',
      contactPhone: (settingsMap.contact_phone as string) || '+91 9158566665',
      address: (settingsMap.address as string) || 'Mumbai, Maharashtra, India',
      socialLinks: {
        facebook: (settingsMap.facebook_url as string) || '',
        linkedin: (settingsMap.linkedin_url as string) || '',
        instagram: (settingsMap.instagram_url as string) || '',
      },
      emailSettings: {
        fromName: (settingsMap.from_name as string) || 'Shatam Care Foundation',
        fromEmail: (settingsMap.from_email as string) || 'shatamcare@gmail.com',
        replyTo: (settingsMap.reply_to as string) || 'shatamcare@gmail.com',
      },
      features: {
        enableNewsletterSignup: (settingsMap.enable_newsletter as boolean) ?? true,
        enableEventRegistration: (settingsMap.enable_events as boolean) ?? true,
        enableContactForm: (settingsMap.enable_contact_form as boolean) ?? true,
        enableDonations: (settingsMap.enable_donations as boolean) ?? false,
      },
    };
  } catch (error) {
    console.error('Error fetching site settings:', error);
    throw error;
  }
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  try {
    const updates: Array<{ key: string; value: unknown }> = [];
    
    if (settings.siteName !== undefined) updates.push({ key: 'site_name', value: settings.siteName });
    if (settings.siteDescription !== undefined) updates.push({ key: 'site_description', value: settings.siteDescription });
    if (settings.contactEmail !== undefined) updates.push({ key: 'contact_email', value: settings.contactEmail });
    if (settings.contactPhone !== undefined) updates.push({ key: 'contact_phone', value: settings.contactPhone });
    if (settings.address !== undefined) updates.push({ key: 'address', value: settings.address });
    
    if (settings.socialLinks) {
      if (settings.socialLinks.facebook !== undefined) updates.push({ key: 'facebook_url', value: settings.socialLinks.facebook });
      if (settings.socialLinks.linkedin !== undefined) updates.push({ key: 'linkedin_url', value: settings.socialLinks.linkedin });
      if (settings.socialLinks.instagram !== undefined) updates.push({ key: 'instagram_url', value: settings.socialLinks.instagram });
    }
    
    if (settings.emailSettings) {
      if (settings.emailSettings.fromName !== undefined) updates.push({ key: 'from_name', value: settings.emailSettings.fromName });
      if (settings.emailSettings.fromEmail !== undefined) updates.push({ key: 'from_email', value: settings.emailSettings.fromEmail });
      if (settings.emailSettings.replyTo !== undefined) updates.push({ key: 'reply_to', value: settings.emailSettings.replyTo });
    }
    
    if (settings.features) {
      if (settings.features.enableNewsletterSignup !== undefined) updates.push({ key: 'enable_newsletter', value: settings.features.enableNewsletterSignup });
      if (settings.features.enableEventRegistration !== undefined) updates.push({ key: 'enable_events', value: settings.features.enableEventRegistration });
      if (settings.features.enableContactForm !== undefined) updates.push({ key: 'enable_contact_form', value: settings.features.enableContactForm });
      if (settings.features.enableDonations !== undefined) updates.push({ key: 'enable_donations', value: settings.features.enableDonations });
    }
    
    // Update each setting
    for (const update of updates) {
      // First check if the setting exists
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', update.key)
        .single();
      
      if (existing) {
        // Update existing setting
        const { error } = await supabase
          .from('site_settings')
          .update({ value: update.value, updated_at: new Date() })
          .eq('key', update.key);
        
        if (error) throw error;
      } else {
        // Insert new setting
        const { error } = await supabase
          .from('site_settings')
          .insert({ key: update.key, value: update.value });
        
        if (error) throw error;
      }
    }
    
    await logAdminActivity('update', 'site_settings', null, { updates });
  } catch (error) {
    console.error('Error updating site settings:', error);
    throw error;
  }
}

// Content Management
export async function getContentItems(page?: string): Promise<ContentItem[]> {
  try {
    let query = supabase.from('content_items').select('*');
    
    if (page && page !== 'all') {
      query = query.eq('page', page);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching content items:', error);
    throw error;
  }
}

export async function createContentItem(contentData: Omit<ContentItem, 'id' | 'created_at' | 'updated_at'>): Promise<ContentItem> {
  try {
    const { data, error } = await supabase
      .from('content_items')
      .insert([contentData])
      .select()
      .single();
    
    if (error) throw error;
    
    await logAdminActivity('create', 'content_item', data.id, contentData);
    return data;
  } catch (error) {
    console.error('Error creating content item:', error);
    throw error;
  }
}

export async function updateContentItem(id: string, updates: Partial<ContentItem>): Promise<ContentItem> {
  try {
    const { data, error } = await supabase
      .from('content_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    await logAdminActivity('update', 'content_item', id, updates);
    return data;
  } catch (error) {
    console.error('Error updating content item:', error);
    throw error;
  }
}

export async function deleteContentItem(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('content_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    await logAdminActivity('delete', 'content_item', id);
  } catch (error) {
    console.error('Error deleting content item:', error);
    throw error;
  }
}

// Media Management
export async function getMediaFiles(category?: string): Promise<MediaFile[]> {
  try {
    let query = supabase.from('media_files').select('*');
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query.order('uploaded_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching media files:', error);
    throw error;
  }
}

export async function uploadMediaFile(file: File, category: string = 'uncategorized'): Promise<MediaFile> {
  try {
    // Check if file is valid
    if (!file || file.size === 0) {
      throw new Error('Invalid file provided');
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${category}/${fileName}`; // Simplified path structure
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);
    
    if (!urlData.publicUrl) {
      throw new Error('Failed to get public URL for uploaded file');
    }

    // Save file metadata to database
    const mediaData = {
      name: fileName,
      original_name: file.name,
      url: urlData.publicUrl,
      type: file.type.startsWith('image/') ? 'image' as const : 
            file.type.startsWith('video/') ? 'video' as const :
            file.type.includes('pdf') || file.type.includes('document') ? 'document' as const : 'other' as const,
      mime_type: file.type,
      size: file.size,
      category,
    };
    
    const { data, error } = await supabase
      .from('media_files')
      .insert([mediaData])
      .select()
      .single();
    
    if (error) {
      console.error('Database insert error:', error);
      // If database insert fails, try to clean up the uploaded file
      try {
        await supabase.storage.from('media').remove([filePath]);
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded file:', cleanupError);
      }
      throw new Error(`Database error: ${error.message}`);
    }
    
    // Log activity (optional, don't fail if this fails)
    try {
      await logAdminActivity('upload', 'media_file', data.id, { filename: file.name, size: file.size });
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
    }
    
    return data;
  } catch (error) {
    console.error('Error uploading media file:', error);
    throw error;
  }
}

export async function deleteMediaFile(id: string): Promise<void> {
  try {
    // Get file info first
    const { data: fileData, error: fetchError } = await supabase
      .from('media_files')
      .select('url, name')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Delete from storage
    const filePath = fileData.url.split('/').pop();
    if (filePath) {
      await supabase.storage
        .from('media')
        .remove([filePath]);
    }
    
    // Delete from database
    const { error } = await supabase
      .from('media_files')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    await logAdminActivity('delete', 'media_file', id, { filename: fileData.name });
  } catch (error) {
    console.error('Error deleting media file:', error);
    throw error;
  }
}

// Admin User Management
export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    // Use a direct join query to get admin users with their emails
    // Since we can't directly access auth.users, we'll use what's available
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Since we may not have direct access to auth.users due to permissions,
    // Let's at least return the admin users we have
    const users: AdminUser[] = (data || []).map(admin => ({
      ...admin,
      email: admin.email || 'User ID: ' + admin.id,  // Use any email field if it exists, otherwise use ID
    }));
    
    return users;
  } catch (error) {
    console.error('Error fetching admin users:', error);
    // Return empty array instead of throwing to prevent UI errors
    return [];
  }
}

export async function createAdminUser(email: string, role: AdminUser['role'] = 'admin'): Promise<void> {
  try {
    // First, invite the user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email);
    
    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');
    
    // Add to admin_users table
    const { error } = await supabase
      .from('admin_users')
      .insert([{
        id: authData.user.id,
        role,
        is_active: true,
        permissions: {},
      }]);
    
    if (error) throw error;
    
    await logAdminActivity('create', 'admin_user', authData.user.id, { email, role });
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

export async function updateAdminUser(id: string, updates: Partial<Pick<AdminUser, 'role' | 'is_active' | 'permissions'>>): Promise<void> {
  try {
    const { error } = await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
    
    await logAdminActivity('update', 'admin_user', id, updates);
  } catch (error) {
    console.error('Error updating admin user:', error);
    throw error;
  }
}

export async function deleteAdminUser(id: string): Promise<void> {
  try {
    // Delete from admin_users table (user remains in auth.users)
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    await logAdminActivity('delete', 'admin_user', id);
  } catch (error) {
    console.error('Error deleting admin user:', error);
    throw error;
  }
}

// Admin Activity Logging
export async function logAdminActivity(
  action: string,
  resourceType: string,
  resourceId?: string | null,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { error } = await supabase
      .from('admin_activity_log')
      .insert([{
        admin_id: user.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details: details || null,
      }]);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error logging admin activity:', error);
    // Don't throw - logging failures shouldn't break the main operation
  }
}

export async function getAdminActivity(limit: number = 50): Promise<AdminActivity[]> {
  try {
    const { data, error } = await supabase
      .from('admin_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching admin activity:', error);
    throw error;
  }
}
