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

  async sendWelcomeEmail(to: string, name: string) {
    await this.transporter.sendMail({
      from: `"KronLux Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Chào mừng bạn đến với KronLux Shop',
      html: `<h3>Xin chào ${name},</h3>
      <p>Cảm ơn bạn đã đăng ký tài khoản tại KronLux Shop. Chúng tôi rất vui được chào đón bạn!</p>
      <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email này.</p>
      <p>Cảm ơn bạn đã mua sắm tại KronLux Shop!</p>`,
    });
  }

  async supportRequestCreated(to: string, supportRequestId: string) {
    await this.transporter.sendMail({
      from: `"KronLux Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Yêu cầu hỗ trợ đã được gửi',
      html: `<h3>Yêu cầu hỗ trợ của bạn với ID #${supportRequestId} đã được gửi thành công!</h3>
      <p>Chúng tôi sẽ xem xét yêu cầu của bạn và liên hệ với bạn trong thời gian sớm nhất.</p>
      `,
    });
  }

  async supportRequestResponse(
    to: string,
    supportRequestId: string,
    response: string,
  ) {
    await this.transporter.sendMail({
      from: `"KronLux Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Phản hồi yêu cầu hỗ trợ',
      html: `<h3>Chúng tôi đã phản hồi yêu cầu hỗ trợ của bạn với ID #${supportRequestId}!</h3>
      <p>${response}</p>
      <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email này.</p>
      `,
    });
  }

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

  async sendReturnRequestCreated(to: string, returnRequestId: string) {
    await this.transporter.sendMail({
      from: `"KronLux Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Yêu cầu đổi trả đã được tạo',
      html: `<h3>Yêu cầu đổi trả của bạn với ID #${returnRequestId} đã được tạo thành công!</h3>
      <p>Chúng tôi sẽ xem xét yêu cầu của bạn và liên hệ với bạn trong thời gian sớm nhất.</p>
      <p>Cảm ơn bạn đã mua sắm tại KronLux Shop!</p>`,
    });
  }

  async sendReturnRequestApproved(to: string, returnRequestId: string) {
    await this.transporter.sendMail({
      from: `"KronLux Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Yêu cầu đổi trả đã được phê duyệt',
      html: `<h3>Yêu cầu đổi trả của bạn với ID #${returnRequestId} đã được phê duyệt!</h3>
      <p>Vui lòng giữ sản phẩm để nhân viên giao hàng đến lấy trong thời gian sớm nhất.</p>
      <p>Cảm ơn bạn đã mua sắm tại KronLux Shop!</p>`,
    });
  }

  async sendReturnRequestRejected(to: string, returnRequestId: string) {
    await this.transporter.sendMail({
      from: `"KronLux Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Yêu cầu đổi trả đã bị từ chối',
      html: `<h3>Rất tiếc, yêu cầu đổi trả của bạn với ID #${returnRequestId} đã bị từ chối!</h3>
      <p>Bạn có thể đến cửa hàng, để nhân viên hỗ trợ bạn tốt hơn.</p>
      <p>Nếu vẫn còn thắc mắc, vui lòng liên hệ với chúng tôi qua email này.</p>
      <p>Cảm ơn bạn đã mua sắm tại KronLux Shop!</p>`,
    });
  }

  async sendReturnRequestCompleted(to: string, returnRequestId: string) {
    await this.transporter.sendMail({
      from: `"KronLux Shop" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Yêu cầu đổi trả đã hoàn thành',
      html: `<h3>Yêu cầu đổi trả của bạn với ID #${returnRequestId} đã được hoàn thành!</h3>
      <p>Trong vòng 2-3 ngày tới, nhân viên giao hàng sẽ đến lấy sản phẩm của bạn. Vui lòng bạn hãy giữ điện thoại bên mình để nhận thông báo từ nhân viên giao hàng.</p>
      <p></p>
      <p>Cảm ơn bạn đã mua sắm tại KronLux Shop! Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>`,
    });
  }
}
