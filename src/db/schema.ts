import { pgTable, text, varchar, timestamp, boolean, primaryKey, integer, pgEnum, serial, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const discountType = pgEnum('discount_type', ['percentage', 'fixed']);
export const userRole = pgEnum('user_role', ['super_admin','admin', 'customer', 'expert','customer_service']);
export const bookingStatus = pgEnum('booking_status', ['pending', 'confirmed', 'cancelled', 'completed']);
export const orderStatus = pgEnum('order_status', ['pending', 'paid', 'failed', 'refunded']);
export const propertyType = pgEnum('property_type', ['apartment', 'villa', 'bungalow', 'house', 'office']);
export const propertySize = pgEnum('property_size', ['Studio','1 BHK', '2 BHK', '3 BHK', '4 BHK', '5 BHK','large', 'extra_large','Small Office','Medium Office','Large Office']);


export const roles = pgTable('roles', {
    id: serial('id').primaryKey(),
    name: userRole('name').unique().notNull(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').unique(),
  password: text('password').notNull(),
  phone: text('phone').unique().notNull(),
  role: userRole('role').notNull(),
  designation: text('designation'),
  isVip: boolean('is_vip').default(false),
  vipStartDate: timestamp('vip_start_date'),
  vipEndDate: timestamp('vip_end_date'),
  vipMembershipTerm: text('vip_membership_term'),
  isVerified: boolean('is_verified').default(false),
  otp: text('otp'),
  otpExpiresAt: timestamp('otp_expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  parentCategoryId: integer('parent_category_id'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const cities = pgTable('cities', {
  id: serial('id').primaryKey(),
  city: text('city').notNull(),
  lat: text('lat'),
  lng: text('lng'),
  country: text('country'),
  iso2: text('iso2'),
  state: text('state'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});


export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => categories.id),
  cityId: integer('city_id').references(() => cities.id),
  imageUrl: text('image_url'),
  videoUrl: text('video_url'),
  price: integer('price'),
  term: text('term'),
  termUnit: text('term_unit'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const servicesDetails = pgTable('services_details', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  serviceId: integer('service_id').references(() => services.id),
  lang: text('lang').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const servicesPricing = pgTable('services_pricing', {
  id: serial('id').primaryKey(),
  price: integer('price'),
  term: text('term'),
  termUnit: text('term_unit').notNull(),
  cityId: integer('city_id').references(() => cities.id),
  serviceId: integer('service_id').references(() => services.id),
  lang: text('lang').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const userWallets = pgTable('user_wallets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  balance: integer('balance').notNull().default(0), // Stored in cents
  points:integer('points').notNull().default(0),
  currency: text('currency').notNull().default('INR'), // Default currency
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const promoCodes = pgTable('promocodes', {
  id: serial('id').primaryKey(),
  code: text('code').unique().notNull(),
  discountType: discountType('discount_type').notNull(),
  discountValue: integer('discount_value').notNull(), // e.g., 10 for 10% or 500 for $5.00
  expiryDate: timestamp('expiry_date'), // Nullable, some might not expire
  usageLimit: integer('usage_limit'), // Nullable, some might have unlimited uses
  timesUsed: integer('times_used').notNull().default(0),
  serviceId: integer('service_id').references(() => services.id), // Optional: if a promocode is specific to a service
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});



export const offers = pgTable('offers', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  link: text('link'), // Link to navigate to on click
  promocodeId: integer('promocode_id').references(() => promoCodes.id),
  isActive: boolean('is_active').default(true).notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const offerRelations = relations(offers, ({ one }) => ({
  promocode: one(promoCodes, {
    fields: [offers.promocodeId],
    references: [promoCodes.id],
  }),
}));

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id').references(() => bookings.id).unique().notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('INR'),
  status: orderStatus('status').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  serviceId: integer('service_id').references(() => services.id),
  promocodeId: integer('promocode_id').references(() => promoCodes.id),
  bookingDate: timestamp('booking_date').notNull(),
  status: bookingStatus('status').notNull(),
  propertyType: propertyType('property_type'),
  propertySize: propertySize('property_size'),
  address: text('address'),
  tipAmount: integer('tip_amount').default(0),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});



export const permissions = pgTable('permissions', {
    id: serial('id').primaryKey(),
    name: text('name').unique().notNull(),
});

export const rolePermissions = pgTable('role_permissions', {
    roleId: integer('role_id').references(() => roles.id),
    permissionId: integer('permission_id').references(() => permissions.id),
}, (t) => ({
    pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
}));

export const userWalletRelations = relations(userWallets, ({ one }) => ({
  user: one(users, {
    fields: [userWallets.userId],
    references: [users.id],
  }),
}));

export const bookingLogs = pgTable('booking_logs', {
    id: serial('id').primaryKey(),
    bookingId: integer('booking_id').references(() => bookings.id),
    status: bookingStatus('status').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const orderLogs = pgTable('order_logs', {
    id: serial('id').primaryKey(),
    orderId: integer('order_id').references(() => orders.id),
    status: orderStatus('status').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const userRelations = relations(users, ({ one, many }) => ({
    bookings: many(bookings), // A user can have many bookings
    wallet: one(userWallets, { // A user has one wallet
      fields: [users.id],
      references: [userWallets.userId],
    }),
    orders: many(orders),
}));

export const roleSettings = pgTable('role_settings', {
  id: serial('id').primaryKey(),
  roleId: integer('role_id').references(() => roles.id).notNull(),
  key: text('settings_key').notNull(),
  value: text('settings_value'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  unq: unique('role_settings_role_id_key_unq').on(table.roleId, table.key),
}));

export const promocodeRelations = relations(promoCodes, ({ one, many }) => ({
  service: one(services, { fields: [promoCodes.serviceId], references: [services.id] }), // A promocode can be for a specific service
  bookings: many(bookings),
  offers: many(offers),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
    booking: one(bookings, {
        fields: [orders.bookingId],
        references: [bookings.id],
    }),
    user: one(users, {
        fields: [orders.userId],
        references: [users.id],
    }),
    logs: many(orderLogs),
}));

export const serviceRelations = relations(services, ({ one, many }) => ({
    bookings: many(bookings),
    details: many(servicesDetails),
    pricing: many(servicesPricing),
    category: one(categories, {
        fields: [services.categoryId],
        references: [categories.id],
    }),
    city: one(cities, {
        fields: [services.cityId],
        references: [cities.id],
    }),
}));

export const cityRelations = relations(cities, ({ many }) => ({
    services: many(services),
    servicesPricing: many(servicesPricing),
}));

export const serviceDetailsRelations = relations(servicesDetails, ({ one }) => ({
    service: one(services, {
        fields: [servicesDetails.serviceId],
        references: [services.id],
    }),
}));

export const servicePricingRelations = relations(servicesPricing, ({ one }) => ({
    service: one(services, {
        fields: [servicesPricing.serviceId],
        references: [services.id],
    }),
    city: one(cities, {
        fields: [servicesPricing.cityId],
        references: [cities.id],
    }),
}));

export const roleRelations = relations(roles, ({ many }) => ({
    permissions: many(rolePermissions),
    users: many(users),
    settings: many(roleSettings),
}));

export const permissionRelations = relations(permissions, ({ many }) => ({
    roles: many(rolePermissions),
}));

export const rolePermissionRelations = relations(rolePermissions, ({ one }) => ({
    role: one(roles, {
        fields: [rolePermissions.roleId],
        references: [roles.id],
    }),
    permission: one(permissions, {
        fields: [rolePermissions.permissionId],
        references: [permissions.id],
    }),
}));



export const roleSettingsRelations = relations(roleSettings, ({ one }) => ({
  role: one(roles, {
    fields: [roleSettings.roleId],
    references: [roles.id],
  }),
}));

export const bookingRelations = relations(bookings, ({ one, many }) => ({
    user: one(users, {
        fields: [bookings.userId],
        references: [users.id],
    }),
    service: one(services, {
        fields: [bookings.serviceId],
        references: [services.id],
    }),
    promoCode: one(promoCodes, { // A booking can use one promocode
      fields: [bookings.promocodeId],
      references: [promoCodes.id],
    }),
    logs: many(bookingLogs),
    order: one(orders, {
      fields: [bookings.id],
      references: [orders.bookingId],
    }),
}));

export const bookingLogRelations = relations(bookingLogs, ({ one }) => ({
    booking: one(bookings, {
        fields: [bookingLogs.bookingId],
        references: [bookings.id],
    }),
}));

export const orderLogRelations = relations(orderLogs, ({ one }) => ({
    order: one(orders, {
        fields: [orderLogs.orderId],
        references: [orders.id],
    }),
}));

export const categoryRelations = relations(categories, ({ one, many }) => ({
	parentCategory: one(categories, {
		fields: [categories.parentCategoryId],
		references: [categories.id],
		relationName: 'parentChild'
	}),
	childCategories: many(categories, {
		relationName: 'parentChild'
	}),
	services: many(services),
}));


