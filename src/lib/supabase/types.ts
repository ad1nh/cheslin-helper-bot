export type Database = {
  public: {
    tables: {
      sellers: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          created_at?: string;
        };
      };
      // ... other existing tables stay the same
    };
  };
}; 