import { Request, Response } from "express";
import CompanyAccount from "../model/company-account.model";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { AccountRequest } from "../interface/request.interface";

export const registerPost = async (req: Request, res: Response) => {
  const existAccount = await CompanyAccount.findOne({
    email: req.body.email
  });

  if (existAccount) {
    res.json({
      code: "error",
      message: "Email đã tồn tại trong hệ thống!"
    });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  req.body.password = bcrypt.hashSync(req.body.password, salt);

  const newRecord = new CompanyAccount(req.body);
  await newRecord.save();

  res.json({
    code: "success",
    message: "Đăng ký thành công!"
  });
}

export const loginPost = async (req: Request, res: Response) => {
  const existAccount = await CompanyAccount.findOne({
    email: req.body.email
  });

  if (!existAccount) {
    res.json({
      code: "error",
      message: "Email không tồn tại trong hệ thống!"
    });
    return;
  }

  const isValidPassword = await bcrypt.compare(req.body.password, `${existAccount.password}`);
  if (!isValidPassword) {
    res.json({
      code: "error",
      message: "Mật khẩu không chính xác!"
    });
    return;
  }

  const token = jwt.sign(
    {
      id: existAccount.id,
      email: existAccount.email
    },
    `${process.env.JWT_SECRET}`,
    {
      expiresIn: '1d'
    }
  );

  res.cookie("token", token, {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,  
    sameSite: "lax" 
  });

  res.json({
    code: "success",
    message: "Đăng nhập thành công!"
  })
}

export const profilePatch = async (req: AccountRequest, res: Response) => {
  if (req.file)
  {
    req.body.logo = req.file.path;
  }
  else
  {
    delete req.body.logo;
  }

  await CompanyAccount.updateOne({
    _id: req.account.id
  }, req.body)
  
  res.json({
    code: "success",
    message: "Cập nhật thành công!"
  })
}