'use strict';
const tableName = 'images';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable(tableName, {
      id: {
        allowNull: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      filename: {
        type: Sequelize.DataTypes.TEXT,
        allowNull: false
      },
      description: { 
        type: Sequelize.TEXT,
        default: '', 
        allowNull: false
      },
      user: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      updatedAt: {
        type: 'TIMESTAMP',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down (queryInterface) {
    await queryInterface.dropTable(tableName);
  }
};
