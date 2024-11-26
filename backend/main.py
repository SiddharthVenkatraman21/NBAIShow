from dotenv import load_dotenv
import os
import openai
import requests
import json
from google.cloud import texttospeech
from pydub import AudioSegment
import boto3
import json
import re
from datetime import datetime


def extract_sections(text):
    # Regular expressions to identify the sections
    json_pattern = r'\[.*\]'  # Matches the JSON part
    description_pattern = r'DESCRIPTION(.*?)QUESTION'  # Matches everything between 'DESCRIPTION' and 'QUESTION'
    question_pattern = r'QUESTION(.*)'  # Matches everything after 'QUESTION'

    # Extract the JSON section
    json_match = re.search(json_pattern, text, re.DOTALL)
    json_section = json_match.group(0) if json_match else None

    # Extract the DESCRIPTION section
    description_match = re.search(description_pattern, text, re.DOTALL)
    description_section = description_match.group(1).strip() if description_match else None

    # Extract the QUESTION section
    question_match = re.search(question_pattern, text, re.DOTALL)
    question_section = question_match.group(1).strip() if question_match else None

    return json_section, description_section, question_section


def trim_game_data(games):
    trimmed_games = []
    
    for game in games:
        trimmed_game = {
            "homeTeam": {
                "teamName": game["homeTeam"]["teamName"],
                "score": game["homeTeam"]["score"],
                "wins": game["homeTeam"]["wins"],
                "losses": game["homeTeam"]["losses"],
                "periods": [period["score"] for period in game["homeTeam"]["periods"]]
            },
            "awayTeam": {
                "teamName": game["awayTeam"]["teamName"],
                "score": game["awayTeam"]["score"],
                "wins": game["awayTeam"]["wins"],
                "losses": game["awayTeam"]["losses"],
                "periods": [period["score"] for period in game["awayTeam"]["periods"]]
            },
            "gameLeaders": {
                "homeLeaders": {
                    "name": game["gameLeaders"]["homeLeaders"]["name"],
                    "points": game["gameLeaders"]["homeLeaders"]["points"],
                    "rebounds": game["gameLeaders"]["homeLeaders"]["rebounds"],
                    "assists": game["gameLeaders"]["homeLeaders"]["assists"]
                },
                "awayLeaders": {
                    "name": game["gameLeaders"]["awayLeaders"]["name"],
                    "points": game["gameLeaders"]["awayLeaders"]["points"],
                    "rebounds": game["gameLeaders"]["awayLeaders"]["rebounds"],
                    "assists": game["gameLeaders"]["awayLeaders"]["assists"]
                }
            }
        }
        trimmed_games.append(trimmed_game)
    
    return trimmed_games




# Open the JSON file and read its content into a string


from nba_api.live.nba.endpoints import scoreboard

game_date = "2024-11-23"  # Example date
games = scoreboard.ScoreBoard()

# json
response = json.loads(games.get_json())
gameStats = trim_game_data(response['scoreboard']['games'])  # Access the 'games' array








# Load environment variables from the .env file
load_dotenv()
MODEL_GPT = 'gpt-4o-mini'
api_key = os.getenv("OPENAI_API_KEY")


# Retrieve API keys
openai_api_key = os.getenv("OPENAI_API_KEY")
# ollama_api_key = os.getenv("OLLAMA_API_KEY")

# Use the OpenAI API

json_example = """
[
   {
      "homeTeam": {
         "teamName": "Jazz",
         "score": 121,
         "wins": 4,
         "losses": 12,
         "periods": [
            28,
            38,
            21,
            34
         ]
      },
      "awayTeam": {
         "teamName": "Knicks",
         "score": 106,
         "wins": 9,
         "losses": 7,
         "periods": [
            28,
            23,
            27,
            28
         ]
      },
      "gameLeaders": {
         "homeLeaders": {
            "name": "Lauri Markkanen",
            "points": 34,
            "rebounds": 9,
            "assists": 2
         },
         "awayLeaders": {
            "name": "Karl-Anthony Towns",
            "points": 16,
            "rebounds": 16,
            "assists": 5
         }
      }
   },
   {
      "homeTeam": {
         "teamName": "Magic",
         "score": 111,
         "wins": 11,
         "losses": 7,
         "periods": [
            33,
            23,
            32,
            23
         ]
      },
      "awayTeam": {
         "teamName": "Pistons",
         "score": 100,
         "wins": 7,
         "losses": 11,
         "periods": [
            21,
            32,
            26,
            21
         ]
      },
      "gameLeaders": {
         "homeLeaders": {
            "name": "Franz Wagner",
            "points": 30,
            "rebounds": 9,
            "assists": 8
         },
         "awayLeaders": {
            "name": "Jaden Ivey",
            "points": 19,
            "rebounds": 7,
            "assists": 2
         }
      }
   },
   {
      "homeTeam": {
         "teamName": "Bulls",
         "score": 131,
         "wins": 7,
         "losses": 11,
         "periods": [
            22,
            38,
            38,
            33
         ]
      },
      "awayTeam": {
         "teamName": "Grizzlies",
         "score": 142,
         "wins": 10,
         "losses": 7,
         "periods": [
            30,
            34,
            45,
            33
         ]
      },
      "gameLeaders": {
         "homeLeaders": {
            "name": "Nikola VuÄ\\x8deviÄ\\x87",
            "points": 26,
            "rebounds": 8,
            "assists": 3
         },
         "awayLeaders": {
            "name": "Scotty Pippen Jr.",
            "points": 30,
            "rebounds": 2,
            "assists": 10
         }
      }
   },
   {
      "homeTeam": {
         "teamName": "Rockets",
         "score": 98,
         "wins": 12,
         "losses": 6,
         "periods": [
            21,
            29,
            21,
            27
         ]
      },
      "awayTeam": {
         "teamName": "Trail Blazers",
         "score": 104,
         "wins": 7,
         "losses": 10,
         "periods": [
            26,
            26,
            21,
            31
         ]
      },
      "gameLeaders": {
         "homeLeaders": {
            "name": "Alperen Sengun",
            "points": 22,
            "rebounds": 5,
            "assists": 5
         },
         "awayLeaders": {
            "name": "Anfernee Simons",
            "points": 25,
            "rebounds": 4,
            "assists": 3
         }
      }
   },
   {
      "homeTeam": {
         "teamName": "Bucks",
         "score": 125,
         "wins": 8,
         "losses": 9,
         "periods": [
            28,
            31,
            37,
            29
         ]
      },
      "awayTeam": {
         "teamName": "Hornets",
         "score": 119,
         "wins": 6,
         "losses": 10,
         "periods": [
            28,
            23,
            34,
            34
         ]
      },
      "gameLeaders": {
         "homeLeaders": {
            "name": "Giannis Antetokounmpo",
            "points": 32,
            "rebounds": 11,
            "assists": 6
         },
         "awayLeaders": {
            "name": "LaMelo Ball",
            "points": 50,
            "rebounds": 5,
            "assists": 10
         }
      }
   },
   {
      "homeTeam": {
         "teamName": "Spurs",
         "score": 104,
         "wins": 9,
         "losses": 8,
         "periods": [
            17,
            21,
            33,
            33
         ]
      },
      "awayTeam": {
         "teamName": "Warriors",
         "score": 94,
         "wins": 12,
         "losses": 4,
         "periods": [
            29,
            21,
            31,
            13
         ]
      },
      "gameLeaders": {
         "homeLeaders": {
            "name": "Victor Wembanyama",
            "points": 25,
            "rebounds": 7,
            "assists": 9
         },
         "awayLeaders": {
            "name": "Andrew Wiggins",
            "points": 20,
            "rebounds": 5,
            "assists": 3
         }
      }
   },
   {
      "homeTeam": {
         "teamName": "Lakers",
         "score": 102,
         "wins": 10,
         "losses": 6,
         "periods": [
            27,
            36,
            15,
            24
         ]
      },
      "awayTeam": {
         "teamName": "Nuggets",
         "score": 127,
         "wins": 9,
         "losses": 6,
         "periods": [
            31,
            26,
            37,
            33
         ]
      },
      "gameLeaders": {
         "homeLeaders": {
            "name": "LeBron James",
            "points": 18,
            "rebounds": 6,
            "assists": 7
         },
         "awayLeaders": {
            "name": "Nikola JokiÄ\\x87",
            "points": 34,
            "rebounds": 13,
            "assists": 8
         }
      }
   }
]
"""


system_prompt = (
    "You are a podcast script creator for a 2-person podcast about the NBA. Do not give them names or reference names for them. The podcast is called the NB AI Show. Make sure to have an appropriate greting and closing."
    "You will be given NBA scores and will need to create a short 30-second podcast script. "
    "You will also be given stat leaders for each game, please have the podcast hosts comment about the most notable/impressive leaders from games. "
    "You are also give the team's wins and losses. This represent their totals for the season, includeing the provided game. If a team with a much worse record beats a team with a better record, you can comment on it."
    "If a winning team has a very good win-loss record, this is defined when there are many more wins than losses, you can comment on their strong play this season."
    "If a losing team has a very bad win-loss record, you can comment about how their struggles continue, or a different phrase with similar meaning."
    "If a game leader has over 40 points, please make the podcast comment on that"
    "If a game leader has over 25 points and over 15 either assists or rebounds, you can comment on that"
    "If a game leader has over 10 points, rebounds, and assists, it is called a triple-double and you should comment on that."
    "In the script, when describing a score it should be X to Y. However, when describing a team's record, it should be X and Y. For example, a game score can be 122 to 96 while a team's record should be said as 9 and 7."
    "The periods array represents the team's score for each quarter. If a team really struggled and scored less than 18 or really excelled and scored more than 40 in a specific quarter, you may comment on it."
    "Each part of the script should include text and a voice field. The voices to use are 'I' and 'H', alternating between in a flowing conversation. "
    "The voices may interject each other to add quick comments or reactions, to make it sound as human-like as possible. Don't forget to add a closing at the end of the podcasts, it's a daily podcast so the script can allude to seeing the viewers again tomorrow."
    "The format of the input will be a JSON with multiple games. Here is an example of the input for 1 day's scores. The first game in the example represents that the Milwaukee Bucks hosted the Washington Wizards and beat them 129 to 111: "
    "{json_example}\n\n"
    "In the output, it should start with the json list. Put the word JSON on its own line right before the list, and do it exactly as shown because I am directly putting the following list into a json tool. "
    "Next, put the a new line then the word DESCRIPTION on its own line. Then on the next line give a short catchy description based on a player's performance from tonight. It should be 41 characters or less. Do not talk about a player and a different team, if you include a player then only include the team he plays for or do not include a team. I have given an example." 
    "Next, put a new line and the word QUESTION on its own line. Then on a new line, write a short question, less than 60 characters, about a team from the podcast's future. Such as: Will the Rockets Bounce Back? or Will the Celtics Win Streak Continue? It should be a good podcast-ending question to leave the listeners with."
    "Here is the format of a sample output from the provided the input. I have shortened the podcast length just for this example: "
    "JSON"
    "[\n"
    "    {\"text\": \"Hello, welcome to our podcast. I'm your host.\", \"voice\": \"I\"},\n"
    "    {\"text\": \"And I'm your co-host. Let's dive into today's topic!\", \"voice\": \"H\"},\n"
    "    {\"text\": \"The Utah Jazz dominated the New York Knicks 121 to 106.\", \"voice\": \"I\"},\n"
    "    {\"text\": \"That was a much needed win for Lauri Markkanen and the Jazz, who were 3-12 on the season until that point\", \"voice\": \"H\"}\n"
    "]"
    "DESCRIPTION"
    "LaMelo's 50 points steals the spotlight!"
    "QUESTION"
    "Is it time for the Knicks to make some changes?"
)


user_prompt = "Create a podcast about last night's NBA scores: " + str(gameStats)



messages = [
    {"role":"user", "content":user_prompt},
    {"role": "system", "content":system_prompt}
]




response = openai.chat.completions.create(
    model = MODEL_GPT, 
    messages = messages
)
totalResponse = response.choices[0].message.content
json_section, description_section, question_section = extract_sections(totalResponse)
script_segments = json.loads(json_section)










# Initialize Google Text-to-Speech client
client = texttospeech.TextToSpeechClient()

audio_files = []




for i, segment in enumerate(script_segments):
    synthesis_input = texttospeech.SynthesisInput(text=segment["text"])
    voice = texttospeech.VoiceSelectionParams(
    language_code="en-US",
    name=f"en-US-Standard-{segment['voice'][-1]}"  # Adjust this based on the 'voice' key (e.g., 'J' or 'H')
)

    audio_config = texttospeech.AudioConfig(audio_encoding=texttospeech.AudioEncoding.MP3)

    # Call Google Cloud TTS
    response = client.synthesize_speech(
        input=synthesis_input,
        voice=voice,
        audio_config=audio_config
    )

    file_name = f"segment_{i}.mp3"
    with open(file_name, "wb") as out:
        out.write(response.audio_content)
    audio_files.append(file_name)

# Combine audio files
from pydub import AudioSegment

# Load your background music
background_music = AudioSegment.from_file("background.mp3", format="mp3")

# Adjust the volume of the background music if necessary

# Load your podcast audio
final_audio = AudioSegment.empty()
for file_name in audio_files:
    audio = AudioSegment.from_file(file_name, format="mp3")
    final_audio += audio
silence = AudioSegment.silent(duration=5000)

# Add silence at the beginning of the final podcast audio
final_audio_with_silence = silence + final_audio + silence

while len(background_music) < len(final_audio_with_silence):
    background_music += background_music

# Trim the extended background music to exactly match the podcast length
background_music = background_music[:len(final_audio_with_silence)]

# Lower the volume for the first 5 seconds
background_music_early = background_music[:4000].apply_gain(-10)

# Adjust volume for the middle section (-18 dB)
background_music_mid = background_music[4000:-5000].apply_gain(-19)

background_music_end = background_music[-5000:].apply_gain(-9)



# Combine all the parts
background_music_final = background_music_early + background_music_mid+background_music_end

# Overlay the background music with the podcast
combined = final_audio_with_silence.overlay(background_music_final)

# Export the final podcast
currTime = datetime.now().isoformat()
file_name_final = f"podcast_{currTime}.mp3"
combined.export(f"{file_name_final}", format="mp3")

print(f"Podcast created as {file_name_final}")



s3 = boto3.client('s3')
bucket_name = 'podcastfilestorage'
file_path = file_name_final
file_key = file_name_final

# Upload file to S3
s3.upload_file(file_path, bucket_name, file_key, ExtraArgs={'ContentType': 'audio/mpeg'})

# Generate the URL
file_url = f'https://{bucket_name}.s3.amazonaws.com/{file_key}'


# Initialize the DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

# Connect to your DynamoDB table
table_name = 'Podcasts'
table = dynamodb.Table(table_name)
from mutagen.mp3 import MP3

# Get the duration of the MP3 file
audio = MP3(file_path)
duration = audio.info.length  # Duration in seconds

def convert_seconds_to_decimal(duration_in_seconds):
    # Extract minutes and seconds
    minutes = int(duration_in_seconds // 60)  # Get the full minutes
    seconds = duration_in_seconds % 60  # Get the remaining seconds
    
    # Format the result to 2 decimal places
    return f"{minutes}:{seconds:04.1f}"

# Define the item to insert
item = {
    'podcast_id': f"podcast_{currTime}",  # Replace with your Partition Key value
    'timestamp': currTime,  # Current timestamp as Sort Key
    'S3Url': f'{file_url}',  # S3 URL
    'Description': description_section, 
    'duration': convert_seconds_to_decimal(duration), # Duration in seconds (add the duration here if available)
    'Question': question_section
}

# Insert the item
response = table.put_item(Item=item)

print(f"File metadata saved to DynamoDB: {response}")
