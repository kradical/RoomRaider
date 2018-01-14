exports.up = (pgm) => {
  pgm.createTable('users', {
    id: 'id',
    name: {
      type: 'text',
      notNull: true,
    },
    // the pw hash
    password: {
      type: 'text',
      notNull: true,
    },
    // 'system', 'user', 'entity',
    type: {
      type: 'text',
      notNull: true,
      default: 'user',
    },
    username: {
      type: 'text',
      unique: true,
      notNull: true,
    },
  });
  pgm.createTable('buildings', {
    id: 'id',
    name: {
      type: 'text',
      notNull: true,
    },
  });
  pgm.createTable('rooms', {
    id: 'id',
    number: {
      type: 'text',
      notNull: true,
    },

    // many-to-one building
    building_id: {
      type: 'int4 REFERENCES buildings(id)',
      notNull: true,
    },
  });
  pgm.createTable('bookings', {
    id: 'id',
    startTime: { type: 'timestamp with time zone'},
    endTime: { type: 'timestamp with time zone'},

    // many-to-one room
    room_id: {
      type: 'int4 REFERENCES rooms(id)',
      notNull: true,
    },
    // many-to-one user
    user_id: {
      type: 'int4 REFERENCES users(id)',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('rooms');
  pgm.dropTable('buildings');
  pgm.dropTable('users');
  pgm.dropTable('bookings');
};
