import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  async sendOTP(to: string, otp: string) {
    await this.transporter.sendMail({
      from: `"KronLux Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Mã OTP của bạn',
      html: `<h3>Mã OTP của bạn là: <b>${otp}</b></h3>`,
    });
  }

  async sendOrderSuccess(to: string, orderId: string) {
    await this.transporter.sendMail({
      from: `"KronLux Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Xác nhận đơn hàng',
      html: `<h3>Đơn hàng của bạn #${orderId} đã được đặt thành công!</h3>
      <p>Bạn có thể kiểm tra đơn hàng tại trang quản lý đơn hàng của bạn. Hoặc nếu bạn không đăng nhập, bạn có thể kiểm tra đơn hàng của mình tại trang <a href="${process.env.FRONTEND_URL}/order/${orderId}">đây</a>.</p>
      <p>Cảm ơn bạn đã mua sắm tại KronLux Shop!</p>`,
    });
  }

  async sendOrderCancelled(to: string, orderId: string) {
    await this.transporter.sendMail({
      from: `"KronLux Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Thông báo hủy đơn hàng',
      html: `<h3>Đơn hàng của bạn #${orderId} đã bị hủy!</h3>
      <p>Chúng tôi rất tiếc vì sự bất tiện này. Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email này.</p>
      <p>Cảm ơn bạn đã mua sắm tại KronLux Shop!</p>`,
    });
  }
}
