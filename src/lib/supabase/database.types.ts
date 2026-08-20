export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "customer" | "host" | "operator";
          provider: string | null;
          provider_user_id: string | null;
          email: string | null;
          name: string | null;
          phone: string | null;
          avatar_url: string | null;
          status: "active" | "pending" | "suspended";
          last_sign_in_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      accommodations: {
        Row: {
          id: string;
          name: string;
          area: string;
          address: string | null;
          concept: string | null;
          rating: number;
          review_count: number;
          status: "active" | "hidden" | "suspended";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["accommodations"]["Row"]> & {
          id: string;
          name: string;
          area: string;
        };
        Update: Partial<Database["public"]["Tables"]["accommodations"]["Row"]>;
        Relationships: [];
      };
      rooms: {
        Row: {
          id: string;
          accommodation_id: string;
          name: string;
          type: "private_house" | "glamping" | "camp_site";
          base_price: number;
          weekend_extra: number;
          extra_adult_price: number;
          extra_child_price: number;
          standard_capacity: number;
          max_capacity: number;
          description: string | null;
          tags: string[];
          amenities: Json;
          status: "active" | "hidden";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["rooms"]["Row"]> & {
          id: string;
          accommodation_id: string;
          name: string;
          type: "private_house" | "glamping" | "camp_site";
        };
        Update: Partial<Database["public"]["Tables"]["rooms"]["Row"]>;
        Relationships: [];
      };
      room_images: {
        Row: {
          id: string;
          room_id: string;
          url: string;
          caption: string | null;
          sort_order: number;
          is_cover: boolean;
        };
        Insert: Partial<Database["public"]["Tables"]["room_images"]["Row"]> & {
          room_id: string;
          url: string;
        };
        Update: Partial<Database["public"]["Tables"]["room_images"]["Row"]>;
        Relationships: [];
      };
      room_rates: {
        Row: {
          id: string;
          room_id: string;
          start_date: string;
          end_date: string;
          rate_type: "base" | "seasonal" | "special";
          nightly_price: number;
          weekend_extra: number;
          priority: number;
          memo: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["room_rates"]["Row"]> & {
          room_id: string;
          start_date: string;
          end_date: string;
          nightly_price: number;
        };
        Update: Partial<Database["public"]["Tables"]["room_rates"]["Row"]>;
        Relationships: [];
      };
      booking_options: {
        Row: {
          id: string;
          accommodation_id: string;
          name: string;
          description: string | null;
          price: number;
          status: "active" | "hidden";
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["booking_options"]["Row"]> & {
          id: string;
          accommodation_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["booking_options"]["Row"]>;
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          booking_no: string;
          room_id: string;
          hold_id: string | null;
          customer_id: string | null;
          check_in: string;
          check_out: string;
          adult_count: number;
          child_count: number;
          guest_name: string;
          guest_phone: string;
          utm_code: string | null;
          status: "hold" | "confirmed" | "cancelled";
          payment_status: "pending" | "paid" | "refunded";
          total_amount: number;
          option_amount: number;
          discount_amount: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["bookings"]["Row"]> & {
          room_id: string;
          check_in: string;
          check_out: string;
          guest_name: string;
          guest_phone: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Row"]>;
        Relationships: [];
      };
      booking_holds: {
        Row: {
          id: string;
          room_id: string;
          check_in: string;
          check_out: string;
          utm_code: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["booking_holds"]["Row"]> & {
          room_id: string;
          check_in: string;
          check_out: string;
          expires_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["booking_holds"]["Row"]>;
        Relationships: [];
      };
      booking_option_items: {
        Row: {
          id: string;
          booking_id: string;
          option_id: string;
          quantity: number;
          unit_price: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["booking_option_items"]["Row"]> & {
          booking_id: string;
          option_id: string;
          unit_price: number;
        };
        Update: Partial<Database["public"]["Tables"]["booking_option_items"]["Row"]>;
        Relationships: [];
      };
      room_blocks: {
        Row: {
          id: string;
          room_id: string;
          check_in: string;
          check_out: string;
          reason: string | null;
          external_source_id: string | null;
          external_uid: string | null;
          source_channel: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["room_blocks"]["Row"]> & {
          room_id: string;
          check_in: string;
          check_out: string;
        };
        Update: Partial<Database["public"]["Tables"]["room_blocks"]["Row"]>;
        Relationships: [];
      };
      youtube_campaigns: {
        Row: {
          id: string;
          code: string;
          title: string;
          video_url: string | null;
          room_id: string | null;
          category: "all" | "exterior" | "interior";
          tag: string;
          description: string | null;
          thumbnail_url: string | null;
          coupon_amount: number;
          status: "active" | "ended";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["youtube_campaigns"]["Row"]> & {
          code: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["youtube_campaigns"]["Row"]>;
        Relationships: [];
      };
      naver_links: {
        Row: {
          id: string;
          accommodation_id: string;
          room_id: string | null;
          link_type: "blog" | "review";
          title: string;
          url: string;
          author: string | null;
          excerpt: string | null;
          rating: number | null;
          published_at: string | null;
          sort_order: number;
          status: "active" | "hidden";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["naver_links"]["Row"]> & {
          id: string;
          accommodation_id: string;
          link_type: "blog" | "review";
          title: string;
          url: string;
        };
        Update: Partial<Database["public"]["Tables"]["naver_links"]["Row"]>;
        Relationships: [];
      };
      nearby_places: {
        Row: {
          id: string;
          accommodation_id: string;
          place_type: "attraction" | "restaurant";
          name: string;
          category: string;
          address: string | null;
          distance_label: string | null;
          travel_time: string | null;
          description: string | null;
          url: string | null;
          map_url: string | null;
          image_url: string | null;
          sort_order: number;
          status: "active" | "hidden";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["nearby_places"]["Row"]> & {
          id: string;
          accommodation_id: string;
          place_type: "attraction" | "restaurant";
          name: string;
          category: string;
        };
        Update: Partial<Database["public"]["Tables"]["nearby_places"]["Row"]>;
        Relationships: [];
      };
      utm_events: {
        Row: {
          id: string;
          event_name: string;
          utm_code: string | null;
          room_id: string | null;
          session_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["utm_events"]["Row"]> & {
          event_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["utm_events"]["Row"]>;
        Relationships: [];
      };
      payment_orders: {
        Row: {
          id: string;
          order_id: string;
          hold_id: string | null;
          customer_id: string | null;
          room_id: string;
          check_in: string | null;
          check_out: string | null;
          provider: "card" | "naverpay" | "tosspay" | "vbank" | "realtime_transfer" | "manual_bank_transfer";
          mode: "mock" | "toss" | "manual";
          amount: number;
          option_amount: number;
          discount_amount: number;
          adult_count: number;
          child_count: number;
          option_items: Json;
          booking_id: string | null;
          status: "ready" | "paid" | "waiting_deposit" | "failed" | "cancelled" | "expired";
          payment_key: string | null;
          checkout: Json;
          utm_code: string | null;
          guest_name: string | null;
          guest_phone: string | null;
          expires_at: string;
          confirmed_at: string | null;
          deposit_due_at: string | null;
          cancelled_at: string | null;
          expired_at: string | null;
          last_error: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["payment_orders"]["Row"]> & {
          order_id: string;
          room_id: string;
          provider: "card" | "naverpay" | "tosspay" | "vbank" | "realtime_transfer" | "manual_bank_transfer";
          mode: "mock" | "toss" | "manual";
          amount: number;
          expires_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["payment_orders"]["Row"]>;
        Relationships: [];
      };
      payment_order_events: {
        Row: {
          id: string;
          order_id: string;
          event_type: "prepared" | "paid" | "waiting_deposit" | "failed" | "cancelled" | "expired";
          from_status: "ready" | "paid" | "waiting_deposit" | "failed" | "cancelled" | "expired" | null;
          to_status: "ready" | "paid" | "waiting_deposit" | "failed" | "cancelled" | "expired" | null;
          payment_key: string | null;
          booking_id: string | null;
          message: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["payment_order_events"]["Row"]> & {
          order_id: string;
          event_type: "prepared" | "paid" | "waiting_deposit" | "failed" | "cancelled" | "expired";
        };
        Update: Partial<Database["public"]["Tables"]["payment_order_events"]["Row"]>;
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          provider: "card" | "naverpay" | "tosspay" | "vbank" | "realtime_transfer" | "manual_bank_transfer";
          payment_key: string | null;
          amount: number;
          status: "ready" | "paid" | "failed" | "cancelled" | "refunded";
          paid_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]> & {
          booking_id: string;
          provider: "card" | "naverpay" | "tosspay" | "vbank" | "realtime_transfer" | "manual_bank_transfer";
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
        Relationships: [];
      };
      settlements: {
        Row: {
          id: string;
          payment_id: string;
          gross_amount: number;
          pg_fee: number;
          platform_fee: number;
          payout_amount: number;
          status: "scheduled" | "paid" | "held";
          payout_due_date: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["settlements"]["Row"]> & {
          payment_id: string;
          gross_amount: number;
          payout_amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["settlements"]["Row"]>;
        Relationships: [];
      };
      notification_queue: {
        Row: {
          id: string;
          booking_id: string | null;
          channel: "alimtalk" | "sms";
          template_type: "booking_confirmed" | "checkin_guide" | "barbecue_reminder";
          recipient_name: string;
          recipient_phone: string;
          message: string;
          scheduled_at: string;
          sent_at: string | null;
          status: "queued" | "sent" | "failed" | "cancelled";
          failure_reason: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["notification_queue"]["Row"]> & {
          template_type: "booking_confirmed" | "checkin_guide" | "barbecue_reminder";
          recipient_name: string;
          recipient_phone: string;
          message: string;
          scheduled_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["notification_queue"]["Row"]>;
        Relationships: [];
      };
      calendar_sync_sources: {
        Row: {
          id: string;
          room_id: string;
          provider: string;
          ical_url: string | null;
          sync_policy: "import_only" | "two_way_later";
          status: "active" | "paused" | "failed";
          last_synced_at: string | null;
          last_error: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["calendar_sync_sources"]["Row"]> & {
          room_id: string;
          provider: string;
        };
        Update: Partial<Database["public"]["Tables"]["calendar_sync_sources"]["Row"]>;
        Relationships: [];
      };
      calendar_sync_events: {
        Row: {
          id: string;
          source_id: string;
          room_id: string;
          external_uid: string;
          summary: string | null;
          check_in: string;
          check_out: string;
          status: "blocked" | "cancelled";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["calendar_sync_events"]["Row"]> & {
          source_id: string;
          room_id: string;
          external_uid: string;
          check_in: string;
          check_out: string;
        };
        Update: Partial<Database["public"]["Tables"]["calendar_sync_events"]["Row"]>;
        Relationships: [];
      };
      pilot_runs: {
        Row: {
          id: string;
          accommodation_id: string;
          status: "draft" | "rehearsal" | "ready" | "open";
          checklist: Json;
          opened_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["pilot_runs"]["Row"]> & {
          accommodation_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["pilot_runs"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
