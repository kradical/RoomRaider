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
  pgm.createTable('campuses', {
    id: 'id',
    name: {
      type: 'text',
      notNull: true,
      unique: true,
    },
  });
  pgm.createTable('buildings', {
    id: 'id',
    name: {
      type: 'text',
      notNull: true,
    },

    // many-to-one campus
    campusId: {
      type: 'INTEGER REFERENCES campuses(id)',
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
    buildingId: {
      type: 'INTEGER REFERENCES buildings(id)',
      notNull: true,
    },
  });
  pgm.createTable('bookings', {
    id: 'id',
    startTime: { type: 'timestamp with time zone'},
    endTime: { type: 'timestamp with time zone'},

    // many-to-one room
    roomId: {
      type: 'INTEGER REFERENCES rooms(id)',
      notNull: true,
    },
    // many-to-one user
    userId: {
      type: 'INTEGER REFERENCES users(id)',
      notNull: true,
    },
  });

  pgm.addConstraint('buildings', 'campusIdName', 'UNIQUE("campusId", "name")');
};

exports.down = (pgm) => {
  pgm.dropTable('bookings');
  pgm.dropTable('users');
  pgm.dropTable('rooms');
  pgm.dropTable('buildings');
  pgm.dropTable('campuses');
};
