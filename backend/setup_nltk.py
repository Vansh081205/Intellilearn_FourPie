"""
NLTK Data Setup Script
Run this once to download all required NLTK data for IntelliLearn backend.
"""

import nltk
import sys


def download_nltk_data():
    """Download all required NLTK datasets."""

    print("=" * 60)
    print("IntelliLearn - NLTK Data Setup")
    print("=" * 60)
    print()

    datasets = [
        ('punkt', 'Punkt Tokenizer Models'),
        ('punkt_tab', 'Punkt Tokenizer Tables'),
        ('stopwords', 'Stopwords Corpus'),
    ]

    success_count = 0
    total = len(datasets)

    for dataset, description in datasets:
        try:
            print(f"📦 Downloading {description} ({dataset})...", end=' ')
            nltk.download(dataset, quiet=True)
            print("✅ Success")
            success_count += 1
        except Exception as e:
            print(f"❌ Failed: {e}")

    print()
    print("=" * 60)

    if success_count == total:
        print(f"✅ All {total} datasets downloaded successfully!")
        print("=" * 60)
        print()
        print("You can now run the backend server:")
        print("  python app.py")
        return 0
    else:
        print(f"⚠️  {total - success_count} dataset(s) failed to download.")
        print("=" * 60)
        print()
        print("Please check your internet connection and try again.")
        return 1


if __name__ == "__main__":
    sys.exit(download_nltk_data())
