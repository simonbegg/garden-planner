// This is used for type casting in various places

import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Plant, GardenLayout, GridCell } from './types';
import { v4 as uuidv4 } from 'uuid';

// User Service
export const userService = {
  signUp: async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, cannot sign up');
      throw new Error('Supabase not configured');
    }
    
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        console.error('Error signing up:', error);
        throw error;
      }
      
      // Create a profile for the user if they were successfully created
      if (data.user && data.user.id) {
        console.log('Creating profile for new user:', data.user.id);
        
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: email,
              display_name: email.split('@')[0]
            });
            
          if (profileError) {
            console.error('Error creating profile after signup:', profileError);
            // We don't throw here because the user was created successfully
            // The profile can be created later when needed
          } else {
            console.log('Profile created successfully for user:', data.user.id);
          }
        } catch (profileCreationError) {
          console.error('Exception creating profile after signup:', profileCreationError);
          // We don't throw here because the user was created successfully
        }
      }
      
      return data;
    } catch (error) {
      console.error('Exception during signup process:', error);
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, cannot sign in');
      throw new Error('Supabase not configured');
    }
    
    try {
      // Sign in the user
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Error signing in:', error);
        throw error;
      }
      
      // Check if profile exists for this user, create if it doesn't
      if (data.user && data.user.id) {
        // Check if profile exists
        const { data: profileData, error: profileCheckError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();
          
        if (profileCheckError || !profileData) {
          console.log('Profile not found for user, creating one:', data.user.id);
          
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: email,
                display_name: email.split('@')[0]
              });
              
            if (profileError) {
              console.error('Error creating profile during signin:', profileError);
              // We don't throw here because the user signed in successfully
            } else {
              console.log('Profile created successfully during signin for user:', data.user.id);
            }
          } catch (profileCreationError) {
            console.error('Exception creating profile during signin:', profileCreationError);
            // We don't throw here because the user signed in successfully
          }
        } else {
          console.log('Profile exists for user:', data.user.id);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Exception during signin process:', error);
      throw error;
    }
  },

  signOut: async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, cannot sign out');
      return;
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getCurrentUser: async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, cannot get current user');
      return null;
    }
    
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },
  
  ensureProfileExists: async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, cannot ensure profile exists');
      return null;
    }
    
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.warn('No authenticated user found');
        return null;
      }
      
      // Check if profile exists
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError || !profileData) {
        console.log('Profile not found for user, creating one:', user.id);
        
        // Create profile
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || 'unknown@example.com',
            display_name: user.email ? user.email.split('@')[0] : 'User'
          })
          .select()
          .single();
          
        if (insertError) {
          console.error('Error creating profile:', insertError);
          return null;
        }
        
        console.log('Profile created successfully for user:', user.id);
        return newProfile;
      }
      
      return profileData;
    } catch (error) {
      console.error('Error ensuring profile exists:', error);
      return null;
    }
  },
  
  createProfile: async (userId: string, email: string, displayName?: string) => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, cannot create profile');
      return null;
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        display_name: displayName || email.split('@')[0]
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
};

// Plant Service
export const plantService = {
  getPlants: async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, using localStorage for plants');
      
      const storedPlants = localStorage.getItem('plants');
      return storedPlants ? JSON.parse(storedPlants) as Plant[] : [];
    }
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.id) {
        console.warn('User not authenticated or missing ID, using localStorage fallback');
        
        const storedPlants = localStorage.getItem('plants');
        return storedPlants ? JSON.parse(storedPlants) as Plant[] : [];
      }
      
      // Check if profile exists, create if it doesn't
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (profileError || !profileData) {
        console.log('Creating profile for user', user.id);
        // Create profile if it doesn't exist
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || 'unknown@example.com',
            display_name: user.email ? user.email.split('@')[0] : 'User'
          });
          
        if (insertError) {
          console.error('Error creating profile:', insertError);
          throw insertError;
        }
      }
      
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .order('name')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching plants:', error);
        
        // Fallback to localStorage
        const storedPlants = localStorage.getItem('plants');
        return storedPlants ? JSON.parse(storedPlants) as Plant[] : [];
      }
      
      // Store in localStorage as backup
      localStorage.setItem('plants', JSON.stringify(data));
      
      // Transform database format to application format
      return data.map(plant => ({
        id: plant.id,
        name: plant.name,
        variety: plant.variety,
        type: plant.type as Plant['type'],
        color: plant.color,
        spacing: plant.spacing,
        plantingTime: plant.planting_time,
        harvestTime: plant.harvest_time,
        plantingDate: plant.planting_date || undefined,
        careInstructions: plant.care_instructions || [],
        growthStage: plant.growth_stage || undefined
      })) as Plant[];
    } catch (error) {
      console.error('Error fetching plants:', error);
      
      // Fallback to localStorage
      const storedPlants = localStorage.getItem('plants');
      return storedPlants ? JSON.parse(storedPlants) as Plant[] : [];
    }
  },

  getPlantById: async (id: string): Promise<Plant | null> => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, using localStorage for plant retrieval');
      
      const storedPlants = localStorage.getItem('plants');
      const plants = storedPlants ? JSON.parse(storedPlants) as Plant[] : [];
      return plants.find(p => p.id === id) || null;
    }
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.id) {
        console.warn('User not authenticated or missing ID, using localStorage fallback');
        
        const storedPlants = localStorage.getItem('plants');
        const plants = storedPlants ? JSON.parse(storedPlants) as Plant[] : [];
        return plants.find(p => p.id === id) || null;
      }
      
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error(`Error retrieving plant with ID ${id}:`, error);
        
        // Fallback to localStorage
        const storedPlants = localStorage.getItem('plants');
        const plants = storedPlants ? JSON.parse(storedPlants) as Plant[] : [];
        return plants.find(p => p.id === id) || null;
      }
      
      // Transform database format to application format
      return {
        id: data.id,
        name: data.name,
        variety: data.variety,
        type: data.type as Plant['type'],
        color: data.color,
        spacing: data.spacing,
        plantingTime: data.planting_time,
        harvestTime: data.harvest_time,
        plantingDate: data.planting_date || undefined,
        careInstructions: data.care_instructions || [],
        growthStage: data.growth_stage || undefined
      };
    } catch (error) {
      console.error(`Error retrieving plant with ID ${id}:`, error);
      
      // Fallback to localStorage
      const storedPlants = localStorage.getItem('plants');
      const plants = storedPlants ? JSON.parse(storedPlants) as Plant[] : [];
      return plants.find(p => p.id === id) || null;
    }
  },

  createPlant: async (plant: Omit<Plant, 'id'>) => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, creating local plant with random ID');
      
      // Create a local plant with a UUID
      const newPlant = { 
        ...plant, 
        id: `local-${uuidv4()}` 
      } as Plant;
      
      // Update localStorage
      const storedPlants = localStorage.getItem('plants');
      const plants = storedPlants ? JSON.parse(storedPlants) as Plant[] : [];
      plants.push(newPlant);
      localStorage.setItem('plants', JSON.stringify(plants));
      
      return newPlant;
    }
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.id) {
        console.warn('User not authenticated or missing ID, using localStorage fallback');
        // Create a local plant with a UUID as fallback
        const newPlant = { 
          ...plant, 
          id: `local-${uuidv4()}` 
        } as Plant;
        
        // Update localStorage
        const storedPlants = localStorage.getItem('plants');
        const plants = storedPlants ? JSON.parse(storedPlants) as Plant[] : [];
        plants.push(newPlant);
        localStorage.setItem('plants', JSON.stringify(plants));
        
        return newPlant;
      }
      
      // Since we can't create profiles due to RLS policies, we'll skip that step
      // and directly try to insert the plant with the user ID
      
      // Transform application format to database format
      const dbPlant = {
        user_id: user.id,
        name: plant.name,
        variety: plant.variety,
        type: plant.type,
        color: plant.color,
        spacing: plant.spacing,
        planting_time: plant.plantingTime,
        harvest_time: plant.harvestTime,
        planting_date: plant.plantingDate || null,
        care_instructions: plant.careInstructions || [],
        growth_stage: plant.growthStage || null
      };
      
      console.log('Inserting plant into database:', dbPlant);
      const { data, error } = await supabase
        .from('plants')
        .insert(dbPlant)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating plant:', error);
        
        // If the error is due to missing profile, create a plant in localStorage as fallback
        if (error.code === '23503' && error.message.includes('violates foreign key constraint')) {
          console.warn('Foreign key constraint error, using localStorage fallback');
          
          const newPlant = { 
            ...plant, 
            id: `local-${uuidv4()}` 
          } as Plant;
          
          // Update localStorage
          const storedPlants = localStorage.getItem('plants');
          const plants = storedPlants ? JSON.parse(storedPlants) as Plant[] : [];
          plants.push(newPlant);
          localStorage.setItem('plants', JSON.stringify(plants));
          
          return newPlant;
        }
        
        throw error;
      }
      
      // Transform database format back to application format
      return {
        id: data.id,
        name: data.name,
        variety: data.variety,
        type: data.type as Plant['type'],
        color: data.color,
        spacing: data.spacing,
        plantingTime: data.planting_time,
        harvestTime: data.harvest_time,
        plantingDate: data.planting_date || undefined,
        careInstructions: data.care_instructions || [],
        growthStage: data.growth_stage || undefined
      } as Plant;
    } catch (error) {
      console.error('Error in createPlant:', error);
      
      // Fallback to localStorage on any error
      const newPlant = { 
        ...plant, 
        id: `local-${uuidv4()}` 
      } as Plant;
      
      // Update localStorage
      const storedPlants = localStorage.getItem('plants');
      const plants = storedPlants ? JSON.parse(storedPlants) as Plant[] : [];
      plants.push(newPlant);
      localStorage.setItem('plants', JSON.stringify(plants));
      
      return newPlant;
    }
  },

  updatePlant: async (id: string, plant: Partial<Plant>) => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, updating plant in localStorage');
      
      // Update in localStorage
      const storedPlants = localStorage.getItem('plants');
      if (storedPlants) {
        const plants = JSON.parse(storedPlants) as Plant[];
        const index = plants.findIndex(p => p.id === id);
        
        if (index !== -1) {
          const updatedPlant = { ...plants[index], ...plant };
          plants[index] = updatedPlant;
          localStorage.setItem('plants', JSON.stringify(plants));
          return updatedPlant;
        }
      }
      
      throw new Error('Plant not found in localStorage');
    }
    
    // Transform application format to database format
    const dbPlant: any = {};
    
    if (plant.name !== undefined) dbPlant.name = plant.name;
    if (plant.variety !== undefined) dbPlant.variety = plant.variety;
    if (plant.type !== undefined) dbPlant.type = plant.type;
    if (plant.color !== undefined) dbPlant.color = plant.color;
    if (plant.spacing !== undefined) dbPlant.spacing = plant.spacing;
    if (plant.plantingTime !== undefined) dbPlant.planting_time = plant.plantingTime;
    if (plant.harvestTime !== undefined) dbPlant.harvest_time = plant.harvestTime;
    if (plant.plantingDate !== undefined) dbPlant.planting_date = plant.plantingDate;
    if (plant.careInstructions !== undefined) dbPlant.care_instructions = plant.careInstructions;
    if (plant.growthStage !== undefined) dbPlant.growth_stage = plant.growthStage;
    
    const { data, error } = await supabase
      .from('plants')
      .update(dbPlant)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating plant:', error);
      throw error;
    }
    
    // Transform database format back to application format
    return {
      id: data.id,
      name: data.name,
      variety: data.variety,
      type: data.type as Plant['type'],
      color: data.color,
      spacing: data.spacing,
      plantingTime: data.planting_time,
      harvestTime: data.harvest_time,
      plantingDate: data.planting_date || undefined,
      careInstructions: data.care_instructions || [],
      growthStage: data.growth_stage || undefined
    } as Plant;
  },

  deletePlant: async (id: string) => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, deleting plant from localStorage');
      
      // Delete from localStorage
      const storedPlants = localStorage.getItem('plants');
      if (storedPlants) {
        const plants = JSON.parse(storedPlants) as Plant[];
        const filteredPlants = plants.filter(p => p.id !== id);
        localStorage.setItem('plants', JSON.stringify(filteredPlants));
        return true;
      }
      
      return false;
    }
    
    const { error } = await supabase
      .from('plants')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting plant:', error);
      throw error;
    }
    
    return true;
  },
};

// Garden Layout Service
export const gardenLayoutService = {
  getLayouts: async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, returning empty layouts array');
      
      // Get from localStorage as fallback
      const storedLayouts = localStorage.getItem('gardenLayouts');
      if (storedLayouts) {
        return JSON.parse(storedLayouts) as GardenLayout[];
      }
      
      return [];
    }
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.id) {
        console.warn('User not authenticated or missing ID, using localStorage fallback');
        // Get from localStorage as fallback
        const storedLayouts = localStorage.getItem('gardenLayouts');
        if (storedLayouts) {
          return JSON.parse(storedLayouts) as GardenLayout[];
        }
        return [];
      }
      
      // Check if profile exists, create if it doesn't
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (profileError || !profileData) {
        // Create profile if it doesn't exist
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || 'unknown@example.com',
            display_name: user.email ? user.email.split('@')[0] : 'User'
          });
      }
      
      const { data, error } = await supabase
        .from('garden_layouts')
        .select('*')
        .order('name')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching garden layouts:', error);
        
        // Get from localStorage as fallback
        const storedLayouts = localStorage.getItem('gardenLayouts');
        if (storedLayouts) {
          return JSON.parse(storedLayouts) as GardenLayout[];
        }
        
        return [];
      }
      
      // Transform database format to application format
      const layouts = data.map(layout => ({
        id: layout.id,
        name: layout.name,
        rows: layout.rows,
        columns: layout.columns,
        grid: typeof layout.grid === 'string' 
          ? JSON.parse(layout.grid) as GridCell[][] 
          : layout.grid as unknown as GridCell[][]
      }));
      
      // Store in localStorage as backup
      localStorage.setItem('gardenLayouts', JSON.stringify(layouts));
      
      return layouts;
    } catch (error) {
      console.error('Error fetching garden layouts:', error);
      
      // Get from localStorage as fallback
      const storedLayouts = localStorage.getItem('gardenLayouts');
      if (storedLayouts) {
        return JSON.parse(storedLayouts) as GardenLayout[];
      }
      
      return [];
    }
  },

  getLayout: async (id: string) => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, using localStorage for garden layout');
      
      // Retrieve from localStorage
      const storedLayouts = localStorage.getItem('gardenLayouts');
      const layouts = storedLayouts ? JSON.parse(storedLayouts) as GardenLayout[] : [];
      const layout = layouts.find(l => l.id === id);
      
      if (!layout) {
        throw new Error(`Garden layout with ID ${id} not found in localStorage`);
      }
      
      return layout;
    }
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.id) {
        console.warn('User not authenticated or missing ID, using localStorage fallback');
        
        // Retrieve from localStorage as fallback
        const storedLayouts = localStorage.getItem('gardenLayouts');
        const layouts = storedLayouts ? JSON.parse(storedLayouts) as GardenLayout[] : [];
        const layout = layouts.find(l => l.id === id);
        
        if (!layout) {
          throw new Error(`Garden layout with ID ${id} not found in localStorage`);
        }
        
        return layout;
      }
      
      // Check if profile exists, create if it doesn't
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (profileError || !profileData) {
        // Create profile if it doesn't exist
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || 'unknown@example.com',
            display_name: user.email ? user.email.split('@')[0] : 'User'
          });
      }
      
      const { data, error } = await supabase
        .from('garden_layouts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error(`Error retrieving garden layout with ID ${id}:`, error);
        
        // Try localStorage as fallback
        const storedLayouts = localStorage.getItem('gardenLayouts');
        const layouts = storedLayouts ? JSON.parse(storedLayouts) as GardenLayout[] : [];
        const layout = layouts.find(l => l.id === id);
        
        if (!layout) {
          throw new Error(`Garden layout with ID ${id} not found in localStorage`);
        }
        
        return layout;
      }
      
      // Transform database format to application format
      return {
        id: data.id,
        name: data.name,
        rows: data.rows,
        columns: data.columns,
        grid: typeof data.grid === 'string' 
          ? JSON.parse(data.grid) as GridCell[][] 
          : data.grid as unknown as GridCell[][]
      } as GardenLayout;
    } catch (error) {
      console.error(`Error retrieving garden layout with ID ${id}:`, error);
      
      // Try localStorage as fallback
      const storedLayouts = localStorage.getItem('gardenLayouts');
      const layouts = storedLayouts ? JSON.parse(storedLayouts) as GardenLayout[] : [];
      const layout = layouts.find(l => l.id === id);
      
      if (!layout) {
        throw new Error(`Garden layout with ID ${id} not found`);
      }
      
      return layout;
    }
  },

  createLayout: async (layout: Omit<GardenLayout, 'id'>) => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, creating local garden layout with random ID');
      
      // Create a local layout with a UUID
      const newLayout = { 
        ...layout, 
        id: `local-${uuidv4()}` 
      } as GardenLayout;
      
      // Update localStorage
      const storedLayouts = localStorage.getItem('gardenLayouts');
      const layouts = storedLayouts ? JSON.parse(storedLayouts) as GardenLayout[] : [];
      layouts.push(newLayout);
      localStorage.setItem('gardenLayouts', JSON.stringify(layouts));
      
      return newLayout;
    }
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.id) {
        console.warn('User not authenticated or missing ID, using localStorage fallback');
        // Create a local layout with a UUID as fallback
        const newLayout = { 
          ...layout, 
          id: `local-${uuidv4()}` 
        } as GardenLayout;
        
        // Update localStorage
        const storedLayouts = localStorage.getItem('gardenLayouts');
        const layouts = storedLayouts ? JSON.parse(storedLayouts) as GardenLayout[] : [];
        layouts.push(newLayout);
        localStorage.setItem('gardenLayouts', JSON.stringify(layouts));
        
        return newLayout;
      }
      
      // Check if profile exists, create if it doesn't
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (profileError || !profileData) {
        // Create profile if it doesn't exist
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || 'unknown@example.com',
            display_name: user.email ? user.email.split('@')[0] : 'User'
          });
      }
      
      // Transform application format to database format
      const dbLayout = {
        user_id: user.id,
        name: layout.name,
        rows: layout.rows,
        columns: layout.columns,
        grid: typeof layout.grid === 'string' ? layout.grid : JSON.stringify(layout.grid)
      };
      
      const { data, error } = await supabase
        .from('garden_layouts')
        .insert(dbLayout)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating garden layout:', error);
        throw error;
      }
      
      // Transform database format back to application format
      return {
        id: data.id,
        name: data.name,
        rows: data.rows,
        columns: data.columns,
        grid: JSON.parse(data.grid) as GridCell[][]
      } as GardenLayout;
    } catch (error) {
      console.error('Error creating garden layout:', error);
      
      // Fallback to localStorage on error
      const newLayout = { 
        ...layout, 
        id: `local-${uuidv4()}` 
      } as GardenLayout;
      
      // Update localStorage
      const storedLayouts = localStorage.getItem('gardenLayouts');
      const layouts = storedLayouts ? JSON.parse(storedLayouts) as GardenLayout[] : [];
      layouts.push(newLayout);
      localStorage.setItem('gardenLayouts', JSON.stringify(layouts));
      
      return newLayout;
    }
  },

  updateLayout: async (id: string, layout: Partial<GardenLayout>) => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, updating garden layout in localStorage');
      
      // Update in localStorage
      const storedLayouts = localStorage.getItem('gardenLayouts');
      const layouts = storedLayouts ? JSON.parse(storedLayouts) as GardenLayout[] : [];
      const layoutIndex = layouts.findIndex(l => l.id === id);
      
      if (layoutIndex === -1) {
        throw new Error(`Garden layout with ID ${id} not found in localStorage`);
      }
      
      layouts[layoutIndex] = { ...layouts[layoutIndex], ...layout };
      localStorage.setItem('gardenLayouts', JSON.stringify(layouts));
      
      return layouts[layoutIndex];
    }
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.id) {
        console.warn('User not authenticated or missing ID, using localStorage fallback');
        
        // Update in localStorage as fallback
        const storedLayouts = localStorage.getItem('gardenLayouts');
        const layouts = storedLayouts ? JSON.parse(storedLayouts) as GardenLayout[] : [];
        const layoutIndex = layouts.findIndex(l => l.id === id);
        
        if (layoutIndex === -1) {
          throw new Error(`Garden layout with ID ${id} not found in localStorage`);
        }
        
        layouts[layoutIndex] = { ...layouts[layoutIndex], ...layout };
        localStorage.setItem('gardenLayouts', JSON.stringify(layouts));
        
        return layouts[layoutIndex];
      }
      
      // Check if profile exists, create if it doesn't
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (profileError || !profileData) {
        // Create profile if it doesn't exist
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || 'unknown@example.com',
            display_name: user.email ? user.email.split('@')[0] : 'User'
          });
      }
      
      // Prepare update data
      const updateData: Record<string, string | number> = {};
      
      if (layout.name !== undefined) updateData.name = layout.name;
      if (layout.rows !== undefined) updateData.rows = layout.rows;
      if (layout.columns !== undefined) updateData.columns = layout.columns;
      if (layout.grid !== undefined) {
        updateData.grid = typeof layout.grid === 'string' 
          ? layout.grid 
          : JSON.stringify(layout.grid);
      }
      
      const { data, error } = await supabase
        .from('garden_layouts')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error(`Error updating garden layout with ID ${id}:`, error);
        
        // Try localStorage as fallback
        const storedLayouts = localStorage.getItem('gardenLayouts');
        const layouts = storedLayouts ? JSON.parse(storedLayouts) as GardenLayout[] : [];
        const layoutIndex = layouts.findIndex(l => l.id === id);
        
        if (layoutIndex === -1) {
          throw new Error(`Garden layout with ID ${id} not found in localStorage`);
        }
        
        layouts[layoutIndex] = { ...layouts[layoutIndex], ...layout };
        localStorage.setItem('gardenLayouts', JSON.stringify(layouts));
        
        return layouts[layoutIndex];
      }
      
      // Transform database format to application format
      return {
        id: data.id,
        name: data.name,
        rows: data.rows,
        columns: data.columns,
        grid: typeof data.grid === 'string' 
          ? JSON.parse(data.grid) as GridCell[][] 
          : data.grid as unknown as GridCell[][]
      } as GardenLayout;
    } catch (error) {
      console.error(`Error updating garden layout with ID ${id}:`, error);
      
      // Try localStorage as fallback
      const storedLayouts = localStorage.getItem('gardenLayouts');
      const layouts = storedLayouts ? JSON.parse(storedLayouts) as GardenLayout[] : [];
      const layoutIndex = layouts.findIndex(l => l.id === id);
      
      if (layoutIndex === -1) {
        throw new Error(`Garden layout with ID ${id} not found`);
      }
      
      layouts[layoutIndex] = { ...layouts[layoutIndex], ...layout };
      localStorage.setItem('gardenLayouts', JSON.stringify(layouts));
      
      return layouts[layoutIndex];
    }
  },

  deleteLayout: async (id: string) => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, deleting garden layout from localStorage');
      
      // Delete from localStorage
      const storedLayouts = localStorage.getItem('gardenLayouts');
      const layouts = storedLayouts ? JSON.parse(storedLayouts) as GardenLayout[] : [];
      const filteredLayouts = layouts.filter(l => l.id !== id);
      
      if (layouts.length === filteredLayouts.length) {
        throw new Error(`Garden layout with ID ${id} not found in localStorage`);
      }
      
      localStorage.setItem('gardenLayouts', JSON.stringify(filteredLayouts));
      return true;
    }
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.id) {
        console.warn('User not authenticated or missing ID, using localStorage fallback');
        
        // Delete from localStorage as fallback
        const storedLayouts = localStorage.getItem('gardenLayouts');
        const layouts = storedLayouts ? JSON.parse(storedLayouts) as GardenLayout[] : [];
        const filteredLayouts = layouts.filter(l => l.id !== id);
        
        if (layouts.length === filteredLayouts.length) {
          throw new Error(`Garden layout with ID ${id} not found in localStorage`);
        }
        
        localStorage.setItem('gardenLayouts', JSON.stringify(filteredLayouts));
        return true;
      }
      
      const { error } = await supabase
        .from('garden_layouts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error(`Error deleting garden layout with ID ${id}:`, error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting garden layout with ID ${id}:`, error);
      
      // Try localStorage as fallback
      const storedLayouts = localStorage.getItem('gardenLayouts');
      const layouts = storedLayouts ? JSON.parse(storedLayouts) as GardenLayout[] : [];
      const filteredLayouts = layouts.filter(l => l.id !== id);
      
      if (layouts.length === filteredLayouts.length) {
        throw new Error(`Garden layout with ID ${id} not found`);
      }
      
      localStorage.setItem('gardenLayouts', JSON.stringify(filteredLayouts));
      return true;
    }
  },
};

// Activity Service
export const activityService = {
  getActivities: async () => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, using localStorage for activities');
      
      const storedActivities = localStorage.getItem('activities');
      return storedActivities ? JSON.parse(storedActivities) : [];
    }
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.id) {
        console.warn('User not authenticated or missing ID, using localStorage fallback');
        
        const storedActivities = localStorage.getItem('activities');
        return storedActivities ? JSON.parse(storedActivities) : [];
      }
      
      // Check if profile exists, create if it doesn't
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (profileError || !profileData) {
        // Create profile if it doesn't exist
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || 'unknown@example.com',
            display_name: user.email ? user.email.split('@')[0] : 'User'
          });
      }
      
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching activities:', error);
        
        // Fallback to localStorage
        const storedActivities = localStorage.getItem('activities');
        return storedActivities ? JSON.parse(storedActivities) : [];
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      
      // Fallback to localStorage
      const storedActivities = localStorage.getItem('activities');
      return storedActivities ? JSON.parse(storedActivities) : [];
    }
  },
  
  createActivity: async (activity: { plant_id: string; type: string; notes: string; date: string }) => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, storing activity in localStorage');
      
      const activityWithId = {
        ...activity,
        id: `local-${uuidv4()}`,
        created_at: new Date().toISOString()
      };
      
      const storedActivities = localStorage.getItem('activities');
      const activities = storedActivities ? JSON.parse(storedActivities) : [];
      activities.push(activityWithId);
      localStorage.setItem('activities', JSON.stringify(activities));
      
      return activityWithId;
    }
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.id) {
        console.warn('User not authenticated or missing ID, using localStorage fallback');
        
        const activityWithId = {
          ...activity,
          id: `local-${uuidv4()}`,
          created_at: new Date().toISOString()
        };
        
        const storedActivities = localStorage.getItem('activities');
        const activities = storedActivities ? JSON.parse(storedActivities) : [];
        activities.push(activityWithId);
        localStorage.setItem('activities', JSON.stringify(activities));
        
        return activityWithId;
      }
      
      // Check if profile exists, create if it doesn't
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (profileError || !profileData) {
        // Create profile if it doesn't exist
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || 'unknown@example.com',
            display_name: user.email ? user.email.split('@')[0] : 'User'
          });
      }
      
      const dbActivity = {
        user_id: user.id,
        plant_id: activity.plant_id,
        activity_type: activity.type,
        activity_date: activity.date,
        notes: activity.notes
      };
      
      const { data, error } = await supabase
        .from('activities')
        .insert(dbActivity)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating activity:', error);
        
        // Fallback to localStorage
        const activityWithId = {
          ...activity,
          id: `local-${uuidv4()}`,
          created_at: new Date().toISOString()
        };
        
        const storedActivities = localStorage.getItem('activities');
        const activities = storedActivities ? JSON.parse(storedActivities) : [];
        activities.push(activityWithId);
        localStorage.setItem('activities', JSON.stringify(activities));
        
        return activityWithId;
      }
      
      return data;
    } catch (error) {
      console.error('Error creating activity:', error);
      
      // Fallback to localStorage
      const activityWithId = {
        ...activity,
        id: `local-${uuidv4()}`,
        created_at: new Date().toISOString()
      };
      
      const storedActivities = localStorage.getItem('activities');
      const activities = storedActivities ? JSON.parse(storedActivities) : [];
      activities.push(activityWithId);
      localStorage.setItem('activities', JSON.stringify(activities));
      
      return activityWithId;
    }
  },
  
  deleteActivity: async (id: string) => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, deleting activity from localStorage');
      
      const storedActivities = localStorage.getItem('activities');
      if (storedActivities) {
        const activities = JSON.parse(storedActivities);
        const filteredActivities = activities.filter((a: { id: string }) => a.id !== id);
        localStorage.setItem('activities', JSON.stringify(filteredActivities));
      }
      
      return true;
    }
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !user.id) {
        console.warn('User not authenticated or missing ID, using localStorage fallback');
        
        const storedActivities = localStorage.getItem('activities');
        if (storedActivities) {
          const activities = JSON.parse(storedActivities);
          const filteredActivities = activities.filter((a: { id: string }) => a.id !== id);
          localStorage.setItem('activities', JSON.stringify(filteredActivities));
        }
        
        return true;
      }
      
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error deleting activity:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting activity:', error);
      
      // Try localStorage as fallback
      const storedActivities = localStorage.getItem('activities');
      if (storedActivities) {
        const activities = JSON.parse(storedActivities);
        const filteredActivities = activities.filter((a: { id: string }) => a.id !== id);
        localStorage.setItem('activities', JSON.stringify(filteredActivities));
      }
      
      return true;
    }
  }
};
