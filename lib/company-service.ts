import { getSupabaseBrowserClient } from '@/utils/supabase/client'

export class CompanyService {
  /**
   * Check if user exists in companies table
   */
  static async isCompanyUser(userId: string): Promise<boolean> {
    try {
      const supabase = getSupabaseBrowserClient()

      const { data, error } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (error) {
        // If no company exists for user, return false
        if (error.code === 'PGRST116') {
          return false
        }
        console.error('Error checking company user:', error)
        return false
      }

      return data !== null
    } catch (error) {
      console.error('Error checking company user:', error)
      return false
    }
  }

  /**
   * Get company for a user
   */
  static async getCompanyByUserId(userId: string) {
    try {
      const supabase = getSupabaseBrowserClient()

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { data: null, error: null }
        }
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error fetching company:', error)
      return { data: null, error: error as Error }
    }
  }
}
