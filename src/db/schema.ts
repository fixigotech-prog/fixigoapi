import { pgTable, text, varchar, timestamp, boolean, primaryKey, integer, serial, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const discountTypes = pgTable('discount_types', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(), // 'percentage', 'fixed'
  createdAt: timestamp('created_at').defaultNow(),
});

export const userRoles = pgTable('user_roles', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(), // 'super_admin', 'admin', 'customer', 'expert', 'customer_service'
  createdAt: timestamp('created_at').defaultNow(),
});

export const bookingStatuses = pgTable('booking_statuses', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(), // 'pending', 'confirmed', 'cancelled', 'completed'
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderStatuses = pgTable('order_statuses', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(), // 'pending', 'paid', 'failed', 'refunded'
  createdAt: timestamp('created_at').defaultNow(),
});

export const propertyTypes = pgTable('property_types', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(), // 'apartment', 'villa', 'bungalow', 'house', 'office'
  createdAt: timestamp('created_at').defaultNow(),
});

export const propertySizes = pgTable('property_sizes', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(), // 'Studio', '1 BHK', '2 BHK', etc.
  createdAt: timestamp('created_at').defaultNow(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').unique(),
  password: text('password').notNull(),
  phone: text('phone').unique().notNull(),
  roleId: integer('role_id').references(() => userRoles.id).notNull(),
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

export const serviceCategories = pgTable('service_categories', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  imageUrl: text('image_url'),
  displayOrder: integer('display_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const serviceCategoryItems = pgTable('service_category_items', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => serviceCategories.id).notNull(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  unq: unique('service_category_items_category_service_unq').on(table.categoryId, table.serviceId),
}));

export const cities = pgTable('cities', {
  id: serial('id').primaryKey(),
  city: text('city').notNull(),
  lat: text('lat'),
  lng: text('lng'),
  country: text('country'),
  iso2: text('iso2'),
  state: text('state'),
  isActive: boolean('is_active').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const frequentServices = pgTable('frequent_services', {
  id: serial('id').primaryKey(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  usageCount: integer('usage_count').default(0).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true),
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
  balance: integer('balance').notNull().default(0),
  points:integer('points').notNull().default(0),
  currency: text('currency').notNull().default('INR'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const promoCodes = pgTable('promocodes', {
  id: serial('id').primaryKey(),
  code: text('code').unique().notNull(),
  discountTypeId: integer('discount_type_id').references(() => discountTypes.id).notNull(),
  discountValue: integer('discount_value').notNull(),
  expiryDate: timestamp('expiry_date'),
  usageLimit: integer('usage_limit'),
  timesUsed: integer('times_used').notNull().default(0),
  serviceId: integer('service_id').references(() => services.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const offers = pgTable('offers', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  link: text('link'),
  promocodeId: integer('promocode_id').references(() => promoCodes.id),
  isActive: boolean('is_active').default(true).notNull(),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id').references(() => bookings.id).unique().notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  subtotal: integer('subtotal').notNull(),
  discountAmount: integer('discount_amount').default(0),
  taxAmount: integer('tax_amount').default(0),
  totalAmount: integer('total_amount').notNull(),
  currency: text('currency').notNull().default('INR'),
  statusId: integer('status_id').references(() => orderStatuses.id).notNull(),
  paymentMethod: text('payment_method'),
  paymentReference: text('payment_reference'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).unique().notNull(),
  invoiceNumber: text('invoice_number').unique().notNull(),
  issueDate: timestamp('issue_date').defaultNow(),
  dueDate: timestamp('due_date'),
  subtotal: integer('subtotal').notNull(),
  discountAmount: integer('discount_amount').default(0),
  taxAmount: integer('tax_amount').default(0),
  totalAmount: integer('total_amount').notNull(),
  currency: text('currency').notNull().default('INR'),
  status: text('status').notNull().default('pending'), // 'pending', 'paid', 'overdue', 'cancelled'
  paidAt: timestamp('paid_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const userAddresses = pgTable('user_addresses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  cityId: integer('city_id').references(() => cities.id),
  propertyTypeId: integer('property_type_id').references(() => propertyTypes.id),
  propertySizeId: integer('property_size_id').references(() => propertySizes.id),
  label: text('label').notNull(),
  address: text('address').notNull(),
  lat: text('lat'),
  lng: text('lng'),
  is_default: boolean('is_default').default(false),
  usageCount: integer('usage_count').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  serviceId: integer('service_id').references(() => services.id),
  promocodeId: integer('promocode_id').references(() => promoCodes.id),
  addressId: integer('address_id').references(() => userAddresses.id),
  bookingDate: timestamp('booking_date').notNull(),
  statusId: integer('status_id').references(() => bookingStatuses.id).notNull(),
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
    id: serial('id').primaryKey(),
    roleId: integer('role_id').references(() => userRoles.id).notNull(),
    permissionId: integer('permission_id').references(() => permissions.id).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
    unq: unique('role_permissions_role_permission_unq').on(table.roleId, table.permissionId),
}));

export const userWalletRelations = relations(userWallets, ({ one }) => ({
  user: one(users, {
    fields: [userWallets.userId],
    references: [users.id],
  }),
}));

export const serviceCategoryRelations = relations(serviceCategories, ({ many }) => ({
  items: many(serviceCategoryItems),
}));

export const serviceCategoryItemRelations = relations(serviceCategoryItems, ({ one }) => ({
  category: one(serviceCategories, {
    fields: [serviceCategoryItems.categoryId],
    references: [serviceCategories.id],
  }),
  service: one(services, {
    fields: [serviceCategoryItems.serviceId],
    references: [services.id],
  }),
}));

export const bookingLogs = pgTable('booking_logs', {
    id: serial('id').primaryKey(),
    bookingId: integer('booking_id').references(() => bookings.id),
    statusId: integer('status_id').references(() => bookingStatuses.id).notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const orderLogs = pgTable('order_logs', {
    id: serial('id').primaryKey(),
    orderId: integer('order_id').references(() => orders.id),
    statusId: integer('status_id').references(() => orderStatuses.id).notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const userRelations = relations(users, ({ one, many }) => ({
    role: one(userRoles, {
        fields: [users.roleId],
        references: [userRoles.id],
    }),
    bookings: many(bookings),
    addresses: many(userAddresses),
    wallet: one(userWallets, {
      fields: [users.id],
      references: [userWallets.userId],
    }),
    orders: many(orders),
}));

export const userAddressRelations = relations(userAddresses, ({ one }) => ({
  user: one(users, {
    fields: [userAddresses.userId],
    references: [users.id],
  }),
  city: one(cities, {
    fields: [userAddresses.cityId],
    references: [cities.id],
  }),
  propertyType: one(propertyTypes, {
    fields: [userAddresses.propertyTypeId],
    references: [propertyTypes.id],
  }),
  propertySize: one(propertySizes, {
    fields: [userAddresses.propertySizeId],
    references: [propertySizes.id],
  }),
}));

export const roleSettings = pgTable('role_settings', {
  id: serial('id').primaryKey(),
  roleId: integer('role_id').references(() => userRoles.id).notNull(),
  key: text('settings_key').notNull(),
  value: text('settings_value'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  unq: unique('role_settings_role_id_key_unq').on(table.roleId, table.key),
}));

export const promocodeRelations = relations(promoCodes, ({ one, many }) => ({
  service: one(services, { fields: [promoCodes.serviceId], references: [services.id] }),
  discountType: one(discountTypes, { fields: [promoCodes.discountTypeId], references: [discountTypes.id] }),
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
    status: one(orderStatuses, {
        fields: [orders.statusId],
        references: [orderStatuses.id],
    }),
    logs: many(orderLogs),
    invoice: one(invoices, {
        fields: [orders.id],
        references: [invoices.orderId],
    }),
}));

export const invoiceRelations = relations(invoices, ({ one }) => ({
    order: one(orders, {
        fields: [invoices.orderId],
        references: [orders.id],
    }),
}));

export const serviceRelations = relations(services, ({ one, many }) => ({
    bookings: many(bookings),
    details: many(servicesDetails),
    pricing: many(servicesPricing),
    frequentServices: many(frequentServices),
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
    userAddresses: many(userAddresses),
}));

export const frequentServiceRelations = relations(frequentServices, ({ one }) => ({
    service: one(services, {
        fields: [frequentServices.serviceId],
        references: [services.id],
    }),
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

export const userRoleRelations = relations(userRoles, ({ many }) => ({
    permissions: many(rolePermissions),
    users: many(users),
    settings: many(roleSettings),
}));

export const permissionRelations = relations(permissions, ({ many }) => ({
    roles: many(rolePermissions),
}));

export const rolePermissionRelations = relations(rolePermissions, ({ one }) => ({
    role: one(userRoles, {
        fields: [rolePermissions.roleId],
        references: [userRoles.id],
    }),
    permission: one(permissions, {
        fields: [rolePermissions.permissionId],
        references: [permissions.id],
    }),
}));

export const roleSettingsRelations = relations(roleSettings, ({ one }) => ({
  role: one(userRoles, {
    fields: [roleSettings.roleId],
    references: [userRoles.id],
  }),
}));

export const userAddressRelations = relations(userAddresses, ({ one, many }) => ({
    user: one(users, {
        fields: [userAddresses.userId],
        references: [users.id],
    }),
    city: one(cities, {
        fields: [userAddresses.cityId],
        references: [cities.id],
    }),
    bookings: many(bookings),
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
    address: one(userAddresses, {
        fields: [bookings.addressId],
        references: [userAddresses.id],
    }),
    status: one(bookingStatuses, {
        fields: [bookings.statusId],
        references: [bookingStatuses.id],
    }),
    propertyType: one(propertyTypes, {
        fields: [bookings.propertyTypeId],
        references: [propertyTypes.id],
    }),
    propertySize: one(propertySizes, {
        fields: [bookings.propertySizeId],
        references: [propertySizes.id],
    }),
    promoCode: one(promoCodes, {
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
    status: one(bookingStatuses, {
        fields: [bookingLogs.statusId],
        references: [bookingStatuses.id],
    }),
}));

export const orderLogRelations = relations(orderLogs, ({ one }) => ({
    order: one(orders, {
        fields: [orderLogs.orderId],
        references: [orders.id],
    }),
    status: one(orderStatuses, {
        fields: [orderLogs.statusId],
        references: [orderStatuses.id],
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

export const offerRelations = relations(offers, ({ one }) => ({
  promocode: one(promoCodes, {
    fields: [offers.promocodeId],
    references: [promoCodes.id],
  }),
}));