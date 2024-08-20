import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {
  Client,
  Events,
  GatewayIntentBits,
  Collection,
  ActivityType,
} from 'discord.js';
import { token } from './config.js';

import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

// @ts-expect-error
client.commands = new Collection();

const commandsFolder = path.join(__dirname, 'commands');

console.log(`Loading commands from ${commandsFolder}`);

const commandFiles = fs
  .readdirSync(commandsFolder)
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  const commandPath = path.join(commandsFolder, file);

  const command = await import(`file://${commandPath}`).then(
    (module) => module.default
  );

  if (
    'data' in command &&
    ('execute' in command || 'autocomplete' in command)
  ) {
    // @ts-expect-error
    client.commands.set(command.data.name, command);
  } else {
    console.error(`Error loading command ${file}`);
  }
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);
  client.user?.setActivity('EGS changes...', { type: ActivityType.Watching });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    // @ts-expect-error
    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true,
        });
      }
    }
  } else if (interaction.isAutocomplete()) {
    // @ts-expect-error
    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error(error);
    }
  }
});

// Start the health check server
const healthCheckPort = 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    if (client.isReady()) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
    } else {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'unhealthy' }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(healthCheckPort, () => {
  console.log(`Health check server running on port ${healthCheckPort}`);
});

client.login(token);
