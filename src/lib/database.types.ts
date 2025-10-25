export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string | null
          profile_type: 'company' | 'individual'
          name: string
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          country: string | null
          company_id: string | null
          tax_id: string | null
          vat_id: string | null
          registration_info: string | null
          bank_name: string | null
          bank_account: string | null
          iban: string | null
          swift: string | null
          logo_url: string | null
          is_vat_payer: boolean | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          profile_type: 'company' | 'individual'
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string | null
          company_id?: string | null
          tax_id?: string | null
          vat_id?: string | null
          registration_info?: string | null
          bank_name?: string | null
          bank_account?: string | null
          iban?: string | null
          swift?: string | null
          logo_url?: string | null
          is_vat_payer?: boolean | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          profile_type?: 'company' | 'individual'
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string | null
          company_id?: string | null
          tax_id?: string | null
          vat_id?: string | null
          registration_info?: string | null
          bank_name?: string | null
          bank_account?: string | null
          iban?: string | null
          swift?: string | null
          logo_url?: string | null
          is_vat_payer?: boolean | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          profile_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          country: string | null
          company_id: string | null
          tax_id: string | null
          vat_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string | null
          company_id?: string | null
          tax_id?: string | null
          vat_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string | null
          company_id?: string | null
          tax_id?: string | null
          vat_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          profile_id: string
          client_id: string | null
          invoice_number: string
          issue_date: string
          delivery_date: string | null
          due_date: string
          language: string | null
          payment_method: string | null
          payment_reference: string | null
          status: string | null
          notes: string | null
          include_qr_code: boolean | null
          subtotal: number | null
          vat_amount: number | null
          total_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          client_id?: string | null
          invoice_number: string
          issue_date: string
          delivery_date?: string | null
          due_date: string
          language?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string | null
          notes?: string | null
          include_qr_code?: boolean | null
          subtotal?: number | null
          vat_amount?: number | null
          total_amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          client_id?: string | null
          invoice_number?: string
          issue_date?: string
          delivery_date?: string | null
          due_date?: string
          language?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string | null
          notes?: string | null
          include_qr_code?: boolean | null
          subtotal?: number | null
          vat_amount?: number | null
          total_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number
          unit: string | null
          unit_price: number
          total_price: number
          sort_order: number | null
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity: number
          unit?: string | null
          unit_price: number
          total_price: number
          sort_order?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          quantity?: number
          unit?: string | null
          unit_price?: number
          total_price?: number
          sort_order?: number | null
          created_at?: string
        }
      }
    }
  }
}
