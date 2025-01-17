import Pickup from '../entities/classes/Pickup';
import Player from '../entities/classes/Player';
import { EntitiesList } from '../entities';
import { ItemState } from '../inventory';
import { ItemsList } from '../items';
import DamageTypes from '../gameplay/DamageTypes';

const EntitiesListByName = EntitiesList.BY_NAME;

interface Command {
    run: (player: Player, ...options: Array<any>) => void;

    help: string;
}

const Commands: {[key: string]: Command} = {
    help: {
        run: (player, ...options: [string]) => {
            const [commandName] = options;

            if (commandName) {
                if (Commands[commandName]) {
                    // Get the help for that command.
                    return Commands[commandName].help;
                }

                return `
                    Invalid command. Commands list:
                    ${Object.keys(Commands).join('\n')}
                `;
            }

            return Commands.help.help;
        },
        help: `
            Prints help for a command.
            Format: /help {command name}
            Example: /help teleport
        `,
    },
    stopserver: {
        run: () => {
            process.exit();
        },
        help: `
            Stops the server. Equivalent to the server crashing.
        `,
    },
    spawnitem: {
        run: (player, ...options: [string, number]) => {
            const [typeName, size] = options;

            const pickupTypeName = `Pickup${typeName}`;

            if (!EntitiesListByName[pickupTypeName]) return;

            if(!player.board) return;

            new (EntitiesListByName[pickupTypeName] as typeof Pickup)({
                row: player.row,
                col: player.col,
                board: player.board,
                itemState: new ItemState({
                    ItemType: ItemsList.BY_NAME[typeName],
                    quantity: size,
                }),
            }).emitToNearbyPlayers();
        },
        help: `
            Spawns an item pickup on the floor at your position.
            Format: /spawnitem {item type name} {quantity}
            Examples:
            - Spawn a stack of 25 items:
            /spawnitem HealthPotion 25
        `,
    },
    listitems: {
        run: () => `
                Items list:
                ${Object.keys(ItemsList.BY_NAME).join('\n')}
            `,
        help: `
            Shows a list of all items that can be spawned.
        `,
    },
    spawnentity: {
        run: (player, ...options: [string, string, string]) => {
            const [typeName, row, col] = options;

            if (typeName === 'Player') return 'Restricted entity type.';
            if (typeName === 'ABSTRACT_CLASSES') return 'Restricted entity type.';
            if (!EntitiesListByName[typeName]) return 'Invalid entity type name.';
            if (Object.prototype.hasOwnProperty.call(EntitiesListByName[typeName], 'abstract')) return 'Restricted entity type.';

            let parsedRow = 0, parsedCol = 0;

            if (row) {
                // Use an offset from player row.
                if (row.startsWith('+') || row.startsWith('-')) {
                    parsedRow = player.row + parseInt(row, 10);
                }
                parsedRow = parseInt(row, 10);
            }
            else {
                parsedRow = player.row;
            }

            if (col) {
            // Use an offset from player column.
                if (col.startsWith('+') || col.startsWith('-')) {
                    parsedCol = player.col + parseInt(col, 10);
                }
                parsedCol = parseInt(col, 10);
            }
            else {
                parsedCol = player.col;
            }

            // Check it is a valid board tile.
            if (!player.board?.getTileAt(parsedRow, parsedCol)) return 'Invalid position.';

            new EntitiesListByName[typeName]({
                row: parsedRow,
                col: parsedCol,
                board: player.board,
            }).emitToNearbyPlayers();

            return false;
        },
        help: `
            Spawns an entity at the target position.
            Use +/- to specify an offset from your position.
            Format: /spawnentity {entity type name} {row} {column}
            Examples:
            - Spawn at your position
            /spawnentity Bandit
            - Spawn offset from your position
            /spawnentity Bandit +2 -5
            - Spawn at target position
            /spawnentity Bandit 123 456
        `,
    },
    listentities: {
        run: () => {
            const types = Object.entries(EntitiesList).filter(([typeKey, EntityType]) => {
                if (typeKey === 'Player') return false;
                // Don't include pickups, as they are covered by listitems.
                if (typeKey.startsWith('Pickup')) return false;

                return true;
            }).map((entry) => entry[0]);

            return `
                Items list:
                ${types.join('\n')}
            `;
        },
        help: `
            Shows a list of all entities that can be spawned.
        `,
    },
    teleport: {
        run: (player, ...options: [string, string]) => {
            const [row, col] = options;

            if (!row || !col) return 'Missing inputs.';

            let parsedRow = 0, parsedCol = 0;

            // Use an offset from player row.
            if (row.startsWith('+') || row.startsWith('-')) {
                parsedRow = player.row + parseInt(row, 10);
            }
            else {
                parsedRow = parseInt(row, 10);
            }

            // Use an offset from player column.
            if (col.startsWith('+') || col.startsWith('-')) {
                parsedCol = player.col + parseInt(col, 10);
            }
            else {
                parsedCol = parseInt(col, 10);
            }

            // Check it is a valid board tile.
            if (!player.board?.getTileAt(parsedRow, parsedCol)) return 'Invalid position.';

            player.changeBoard(player.board, player.board, parsedRow, parsedCol);

            return false;
        },
        help: `
            Instantly moves you to the target position.
            Use +/- to specify an offset from your position.
            Format: /teleport {row} {column}
            Examples:
            - Teleport offset from your position:
            /teleport +5 -8
            - Teleport to target position:
            /teleport 123 456
        `,
    },
    killself: {
        run:
        (player) => {
            player.damage({
                amount: 99999,
                types: [DamageTypes.Biological, DamageTypes.Magical, DamageTypes.Physical],
                penetration: 100,
            });
        },
        help: `
            Kills your character.
        `,
    },
};

export default Commands;
