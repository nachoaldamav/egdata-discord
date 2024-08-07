import fs from 'node:fs';
import path from 'node:path';
import { Client, Events, GatewayIntentBits, Collection } from 'discord.js';
import { token } from './config.js';

import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = new Client({
  intents: GatewayIntentBits.Guilds | GatewayIntentBits.GuildMessages,
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

client.login(token);
