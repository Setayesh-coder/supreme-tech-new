import os
import asyncio
import logging
import httpx
from dotenv import load_dotenv
from balethon import Client
from balethon.conditions import private, successful_payment
from balethon.objects import LabeledPrice

# تنظیمات لاگینگ
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("BaleBot")

load_dotenv()

# خواندن تنظیمات از .env
BOT_TOKEN = os.getenv("BALE_BOT_TOKEN", "1252008658:83N2qMTmfah1SKOtAhSf9D_lLvVmrVjtJks")
PROVIDER_TOKEN = os.getenv("BALE_PROVIDER_TOKEN", "WALLET-oI575muUNT7itN2F")
BOT_API_KEY = os.getenv("BOT_API_KEY", "")
BACKEND_URL = os.getenv("BACKEND_INTERNAL_URL", "http://127.0.0.1:5001")

bot = Client(BOT_TOKEN)

# نگه‌داشتن ارتباط بین کاربر و توکن فاکتور
user_tokens = {}

@bot.on_message(private)
async def handle_start(client: Client, message):
    text = message.text or ""
    
    # استخراج توکن از دستور /start token
    if text.startswith("/start"):
        parts = text.split()
        if len(parts) > 1:
            token = parts[1].strip()
            user_tokens[message.author.id] = token
            
            # ۱. استعلام فاکتور از بک‌اند
            headers = {"x-bot-api-key": BOT_API_KEY}
            params = {"token": token}
            
            async with httpx.AsyncClient() as http_client:
                try:
                    response = await http_client.get(
                        f"{BACKEND_URL}/api/v1/payments/ble/checkout-info",
                        headers=headers,
                        params=params,
                        timeout=10.0
                    )
                    
                    if response.status_code != 200:
                        await message.reply("❌ فاکتور یافت نشد یا منقضی شده است.")
                        return
                    
                    data = response.json()
                    title = data.get("title", "پرداخت فاکتور")
                    description = data.get("description", "پرداخت از طریق ربات بله")
                    amount = int(data.get("amount", 0))  # مبلغ به ریال
                    
                    # ۲. ارسال فاکتور پرداخت به کاربر
                    await client.send_invoice(
                        chat_id=message.chat.id,
                        title=title,
                        description=description,
                        payload=token,
                        provider_token=PROVIDER_TOKEN,
                        prices=[LabeledPrice(label=title, amount=amount)],
                    )
                    
                except Exception as e:
                    logger.error(f"Error fetching checkout info: {e}")
                    await message.reply("⚠️ خطایی در ارتباط با سرور رخ داده است.")
            return

    await message.reply("سلام! برای پرداخت فاکتور لطفا از طریق لینک اختصاصی وارد شوید.")


@bot.on_pre_checkout_query()
async def pre_checkout_handler(client: Client, pre_checkout_query):
    await client.answer_pre_checkout_query(
        pre_checkout_query_id=pre_checkout_query.id,
        ok=True
    )


@bot.on_message(successful_payment)
async def process_successful_payment(client: Client, message):
    payment_info = message.successful_payment
    token = payment_info.invoice_payload
    trans_id = payment_info.telegram_payment_charge_id
    
    headers = {"x-bot-api-key": BOT_API_KEY}
    payload = {
        "token": token,
        "status": "paid",
        "trans_id": trans_id
    }
    
    # ارسال نتیجه موفقیت‌آمیز به بک‌اند
    async with httpx.AsyncClient() as http_client:
        try:
            response = await http_client.post(
                f"{BACKEND_URL}/api/v1/payments/ble/callback",
                headers=headers,
                json=payload,
                timeout=10.0
            )
            
            if response.status_code == 200:
                await message.reply("✅ پرداخت شما با موفقیت ثبت شد. متشکریم!")
            else:
                logger.error(f"Callback failed with status {response.status_code}: {response.text}")
                await message.reply("⚠️ پرداخت انجام شد اما در ثبت نهایی خطایی رخ داد. با پشتیبانی در ارتباط باشید.")
                
        except Exception as e:
            logger.error(f"Error sending callback: {e}")
            await message.reply("⚠️ خطایی در ارتباط با سرور رخ داد.")

if __name__ == "__main__":
    bot.run()