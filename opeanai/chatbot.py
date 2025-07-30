from openai import OpenAI

client = OpenAI(api_key="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")  # your API key here

# Read the segment data from the text file
with open('results.txt', 'r') as file:
    segment_data = file.read()

detectanimal  = "cat"

prompt = f"""
Here is the audio segment analysis data:

{segment_data}

 one of them is {detectanimal} sound which is it just tell the segment number nothing more not even segment number
 """

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": prompt}
    ],
    temperature=0,
)

print(response.choices[0].message.content)
